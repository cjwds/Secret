import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, postAPI } from '../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', interests: [] });
  const [newPhoto, setNewPhoto] = useState('');
  const [newPost, setNewPost] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  
  const { id } = useParams();
  const currentUser = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
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

  // 编辑个人资料
  const handleEditProfile = () => {
    setIsEditing(true);
    setEditForm({
      bio: user.bio || '',
      interests: user.interests || []
    });
  };

  const handleSaveProfile = () => {
    setUser({
      ...user,
      bio: editForm.bio,
      interests: editForm.interests
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // 上传图片
  const handleUploadPhoto = () => {
    if (newPhoto) {
      setUser({
        ...user,
        photos: [
          ...(user.photos || []),
          { url: newPhoto, caption: '新上传的照片' }
        ]
      });
      setNewPhoto('');
    }
  };

  // 发帖
  const handleCreatePost = () => {
    if (newPost) {
      const post = {
        _id: Date.now().toString(),
        content: newPost,
        image: newPostImage,
        tags: [],
        likes: [],
        createdAt: new Date().toISOString(),
        user: {
          username: user.username,
          avatar: user.avatar
        }
      };
      setPosts([post, ...posts]);
      setNewPost('');
      setNewPostImage('');
    }
  };
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <img 
          src={user.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar&image_size=square'} 
          alt="头像" 
          className="profile-avatar-large" 
        />
        <div className="profile-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="profile-name">{user.username}</h1>
            <button 
              onClick={handleEditProfile} 
              className="navbar-button" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              编辑资料
            </button>
          </div>
          
          {isEditing ? (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>个人简介</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', minHeight: '80px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>兴趣爱好</label>
                <input
                  value={editForm.interests.join(', ')}
                  onChange={(e) => setEditForm({ ...editForm, interests: e.target.value.split(',').map(i => i.trim()).filter(Boolean) })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  placeholder="请输入兴趣爱好，用逗号分隔"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={handleSaveProfile} 
                  className="navbar-button" 
                  style={{ padding: '0.5rem 1.5rem' }}
                >
                  保存
                </button>
                <button 
                  onClick={handleCancelEdit} 
                  style={{ padding: '0.5rem 1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'transparent' }}
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
      
      <div className="photo-wall-section">
        <h2 className="section-heading">照片墙</h2>
        
        {/* 图片上传 */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              value={newPhoto}
              onChange={(e) => setNewPhoto(e.target.value)}
              placeholder="请输入图片链接"
              style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
            />
            <button 
              onClick={handleUploadPhoto} 
              className="navbar-button"
              style={{ padding: '0.75rem 1.5rem' }}
            >
              上传图片
            </button>
          </div>
        </div>
        
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
        
        {/* 发帖功能 */}
        <div className="post-form" style={{ marginBottom: '2rem' }}>
          <div className="post-form-header">
            <img 
              src={user.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar&image_size=square'} 
              alt={user.username} 
              className="post-form-avatar" 
            />
            <span style={{ color: 'var(--text)', fontWeight: 500 }}>{user.username}</span>
          </div>
          <textarea
            placeholder="分享你的想法..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="post-form-textarea"
            rows="4"
          />
          <input
            type="text"
            placeholder="图片链接（可选）"
            value={newPostImage}
            onChange={(e) => setNewPostImage(e.target.value)}
            className="post-form-input"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              onClick={handleCreatePost} 
              className="post-button"
              disabled={!newPost.trim()}
            >
              发布
            </button>
          </div>
        </div>
        
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
