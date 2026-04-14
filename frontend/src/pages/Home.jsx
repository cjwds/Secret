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
  
  // 获取帖子列表
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postAPI.getPosts();
        setPosts(response.data);
      } catch (error) {
        console.error('获取帖子失败:', error);
      }
    };
    
    fetchPosts();
  }, []);
  
  // 处理发帖
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      // 未登录，跳转到登录页面
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
  
  // 处理点赞
  const handleLike = async (postId) => {
    if (!token) {
      // 未登录，跳转到登录页面
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
    <div className="home-container">
      <h1>社区首页</h1>
      
      {/* 发帖表单 */}
      <div className="post-form">
        <h2>发布帖子</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <textarea
              placeholder="分享你的想法..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="图片链接（可选）"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="标签，用逗号分隔（可选）"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? '发布中...' : '发布'}
          </button>
        </form>
      </div>
      
      {/* 帖子列表 */}
      <div className="posts-list">
        {posts.map(post => (
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
    </div>
  );
};

export default Home;