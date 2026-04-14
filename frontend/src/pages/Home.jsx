import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../services/api';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, token } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await postAPI.getPosts();
        setPosts(response.data);
      } catch (error) {
        console.error('获取帖子失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      navigate('/login', { state: { from: { pathname: '/' } } });
      return;
    }
    
    try {
      setIsLoading(true);
      const postData = {
        content,
        image,
        tags: tags.split(',').map(tag => tag.trim())
      };
      
      const response = await postAPI.createPost(postData);
      setPosts([response.data, ...posts]);
      setContent('');
      setImage('');
      setTags('');
    } catch (error) {
      console.error('发帖失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLike = async (postId) => {
    if (!token) {
      navigate('/login', { state: { from: { pathname: '/' } } });
      return;
    }
    
    try {
      const response = await postAPI.likePost(postId);
      setPosts(posts.map(post => 
        post._id === postId ? response.data : post
      ));
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };
  
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-brand">社区</span>
          <h1 className="hero-title">连接每一个声音</h1>
          <p className="hero-subtitle">在这里分享你的故事，发现志同道合的人</p>
          {!token && (
            <button 
              className="hero-cta"
              onClick={() => navigate('/login')}
            >
              立即开始
            </button>
          )}
        </div>
      </section>
      
      <main className="main">
        {token && (
          <div className="post-form-container">
            <div className="post-form">
              <div className="post-form-header">
                <img 
                  src={user?.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar&image_size=square'} 
                  alt={user?.username} 
                  className="post-form-avatar" 
                />
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{user?.username}</span>
              </div>
              <form onSubmit={handleSubmit}>
                <textarea
                  placeholder="分享你的想法..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="post-form-textarea"
                  rows="4"
                  required
                />
                <input
                  type="text"
                  placeholder="图片链接（可选）"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="post-form-input"
                />
                <input
                  type="text"
                  placeholder="标签，用逗号分隔"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="post-form-input"
                />
                <div className="post-form-footer">
                  <div></div>
                  <button 
                    type="submit" 
                    disabled={isLoading || !content.trim()}
                    className="post-button"
                  >
                    {isLoading ? '发布中...' : '发布'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        <h2 className="posts-section-title">最新动态</h2>
        
        {isLoading && !posts.length ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        ) : (
          <div>
            {posts.map((post, index) => (
              <article key={post._id} className="post" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="post-header">
                  <img 
                    src={post.user.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar&image_size=square'} 
                    alt={post.user.username} 
                    className="post-avatar" 
                  />
                  <div className="post-user-info">
                    <h3 className="post-username">{post.user.username}</h3>
                    <p className="post-time">{new Date(post.createdAt).toLocaleDateString('zh-CN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                </div>
                <div className="post-body">
                  <p className="post-content">{post.content}</p>
                  {post.image && (
                    <img 
                      src={post.image} 
                      alt="帖子图片" 
                      className="post-image"
                      loading="lazy"
                    />
                  )}
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="post-tag">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="post-footer">
                  <button 
                    onClick={() => handleLike(post._id)} 
                    className={`post-action ${post.likes.includes(user?._id) ? 'liked' : ''}`}
                  >
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
        )}
        
        {!isLoading && posts.length === 0 && (
          <div className="empty">
            <div className="empty-icon">✨</div>
            <h3>还没有内容</h3>
            <p>成为第一个分享的人吧！</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
