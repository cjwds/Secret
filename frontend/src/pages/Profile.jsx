import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, postAPI } from '../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { id } = useParams();
  const currentUser = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        const userId = id || currentUser?._id;
        if (!userId) {
          navigate('/login');
          return;
        }
        
        try {
          // 尝试从API获取用户信息
          const [userResponse, postsResponse] = await Promise.all([
            userAPI.getUser(userId),
            postAPI.getUserPosts(userId)
          ]);
          
          setUser(userResponse.data);
          setPosts(postsResponse.data);
        } catch (apiError) {
          // API请求失败，使用本地存储的模拟数据
          console.log('API请求失败，使用本地存储数据');
          
          // 获取当前用户数据
          if (currentUser) {
            setUser({
              ...currentUser,
              bio: '这是我的个人简介',
              interests: ['编程', '音乐', '旅行'],
              photos: [
                { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20landscape%20photo&image_size=square', caption: '风景照' },
                { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20food&image_size=square', caption: '美食' }
              ]
            });
            setPosts([]); // 模拟空帖子列表
          } else {
            // 从注册用户中查找
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = registeredUsers.find(u => u._id === userId);
            if (user) {
              setUser({
                ...user,
                bio: '这是我的个人简介',
                interests: ['编程', '音乐', '旅行'],
                photos: [
                  { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20landscape%20photo&image_size=square', caption: '风景照' },
                  { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20food&image_size=square', caption: '美食' }
                ]
              });
              setPosts([]);
            }
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserInfo();
  }, [id, currentUser, navigate]);
  
  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="profile-container">
        <div className="empty">
          <div className="empty-icon">👤</div>
          <h3>用户不存在</h3>
        </div>
      </div>
    );
  }
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <img 
          src={user.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar&image_size=square'} 
          alt="头像" 
          className="profile-avatar-large" 
        />
        <div className="profile-info">
          <h1 className="profile-name">{user.username}</h1>
          <p className="profile-bio">{user.bio || '这个人很懒，什么都没写'}</p>
          
          <div>
            <h3 className="profile-section-title">兴趣爱好</h3>
            {user.interests && user.interests.length > 0 ? (
              <div className="interests-list">
                {user.interests.map((interest, index) => (
                  <span key={index} className="interest-tag">{interest}</span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>暂无兴趣爱好</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="photo-wall-section">
        <h2 className="section-heading">照片墙</h2>
        {user.photos && user.photos.length > 0 ? (
          <div className="photos-grid">
            {user.photos.map((photo, index) => (
              <div key={index} className="photo-item">
                <img src={photo.url} alt={`照片 ${index + 1}`} />
                {photo.caption && <p className="photo-caption">{photo.caption}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty" style={{ padding: '2rem' }}>
            <div className="empty-icon">📷</div>
            <p style={{ color: 'var(--text-muted)' }}>暂无照片</p>
          </div>
        )}
      </div>
      
      <div className="user-posts-section">
        <h2 className="section-heading">发布的帖子</h2>
        {posts.length > 0 ? (
          <div>
            {posts.map(post => (
              <article key={post._id} className="post">
                <div className="post-header">
                  <img 
                    src={user.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar&image_size=square'} 
                    alt="头像" 
                    className="post-avatar" 
                  />
                  <div className="post-user-info">
                    <h3 className="post-username">{user.username}</h3>
                    <p className="post-time">{new Date(post.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                </div>
                <div className="post-body">
                  <p className="post-content">{post.content}</p>
                  {post.image && <img src={post.image} alt="帖子图片" className="post-image" />}
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map(tag => (
                      <span key={tag} className="post-tag">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="post-footer">
                  <button className="post-action">
                    <span className="action-icon">❤️</span>
                    <span className="action-count">{post.likes.length}</span>
                  </button>
                  <button className="post-action">
                    <span className="action-icon">💬</span>
                    <span>评论</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty" style={{ padding: '2rem' }}>
            <div className="empty-icon">📝</div>
            <p style={{ color: 'var(--text-muted)' }}>暂无帖子</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
