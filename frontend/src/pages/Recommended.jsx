import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../services/api';

const Recommended = () => {
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, token } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  // 获取推荐内容
  useEffect(() => {
    const fetchRecommendedPosts = async () => {
      try {
        setIsLoading(true);
        const response = await postAPI.getPosts();
        
        // 简单的推荐算法：根据用户兴趣匹配帖子标签
        let posts = response.data;
        if (user && user.interests && user.interests.length > 0) {
          posts = posts.filter(post => {
            return post.tags.some(tag => user.interests.includes(tag));
          });
        }
        
        setRecommendedPosts(posts);
      } catch (error) {
        console.error('获取推荐内容失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendedPosts();
  }, [user]);
  
  // 处理点赞
  const handleLike = async (postId) => {
    if (!token) {
      // 未登录，跳转到登录页面
      navigate('/login', { state: { from: { pathname: '/recommended' } } });
      return;
    }
    
    try {
      const response = await postAPI.likePost(postId);
      setRecommendedPosts(recommendedPosts.map(post => 
        post._id === postId ? response.data : post
      ));
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };
  
  if (isLoading) {
    return <div>加载中...</div>;
  }
  
  return (
    <div className="recommended-container">
      <h1>推荐内容</h1>
      <p>根据您的兴趣为您推荐相关内容</p>
      
      {recommendedPosts.length > 0 ? (
        <div className="posts-list">
          {recommendedPosts.map(post => (
            <div key={post._id} className="post-card">
              <div className="post-header">
                <img src={post.user.avatar || 'https://via.placeholder.com/50'} alt="头像" />
                <div>
                  <h3>{post.user.username}</h3>
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
                <button onClick={() => handleLike(post._id)}>
                  点赞 ({post.likes.length})
                </button>
                <button>评论</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-content">
          <p>暂无推荐内容</p>
          <p>添加更多兴趣爱好以获得个性化推荐</p>
        </div>
      )}
    </div>
  );
};

export default Recommended;