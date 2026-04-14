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
  
  // 获取用户信息和帖子
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        // 如果没有提供id，使用当前用户的id
        const userId = id || currentUser?._id;
        if (!userId) {
          navigate('/login');
          return;
        }
        
        const [userResponse, postsResponse] = await Promise.all([
          userAPI.getUser(userId),
          postAPI.getUserPosts(userId)
        ]);
        
        setUser(userResponse.data);
        setPosts(postsResponse.data);
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserInfo();
  }, [id, currentUser, navigate]);
  
  if (isLoading) {
    return <div>加载中...</div>;
  }
  
  if (!user) {
    return <div>用户不存在</div>;
  }
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={user.avatar || 'https://via.placeholder.com/100'} alt="头像" className="avatar" />
        <div className="profile-info">
          <h1>{user.username}</h1>
          <p>{user.bio || '暂无个人简介'}</p>
          <div className="interests">
            <h3>兴趣爱好</h3>
            {user.interests.length > 0 ? (
              <div className="interest-list">
                {user.interests.map((interest, index) => (
                  <span key={index} className="interest">{interest}</span>
                ))}
              </div>
            ) : (
              <p>暂无兴趣爱好</p>
            )}
          </div>
        </div>
      </div>
      
      {/* 照片墙 */}
      <div className="photo-wall">
        <h2>照片墙</h2>
        {user.photos.length > 0 ? (
          <div className="photos-grid">
            {user.photos.map((photo, index) => (
              <div key={index} className="photo-item">
                <img src={photo.url} alt={`照片 ${index + 1}`} />
                {photo.caption && <p>{photo.caption}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p>暂无照片</p>
        )}
      </div>
      
      {/* 帖子列表 */}
      <div className="user-posts">
        <h2>发布的帖子</h2>
        {posts.length > 0 ? (
          <div className="posts-list">
            {posts.map(post => (
              <div key={post._id} className="post-card">
                <div className="post-header">
                  <img src={user.avatar || 'https://via.placeholder.com/50'} alt="头像" />
                  <div>
                    <h3>{user.username}</h3>
                    <p>{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="post-content">
                  <p>{post.content}</p>
                  {post.image && <img src={post.image} alt="帖子图片" />}
                </div>
                {post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="post-actions">
                  <button>点赞 ({post.likes.length})</button>
                  <button>评论</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>暂无帖子</p>
        )}
      </div>
    </div>
  );
};

export default Profile;