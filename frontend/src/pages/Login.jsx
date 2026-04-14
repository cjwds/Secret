import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, register, clearError } from '../redux/authSlice';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, token } = useSelector(state => state.auth);
  
  // 获取登录前的路径
  const from = location.state?.from?.pathname || '/';
  
  // 如果已经登录，跳转到之前的页面
  if (token) {
    navigate(from, { replace: true });
  }
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(login({ email: formData.email, password: formData.password }));
    } else {
      dispatch(register(formData));
    }
  };
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: ''
    });
  };
  
  return (
    <div className="login-container">
      <h1>{isLogin ? '登录' : '注册'}</h1>
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => dispatch(clearError())}>关闭</button>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">邮箱</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">密码</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? (isLogin ? '登录中...' : '注册中...') : (isLogin ? '登录' : '注册')}
        </button>
      </form>
      <div className="form-toggle">
        <p>{isLogin ? '还没有账号？' : '已有账号？'}</p>
        <button onClick={toggleForm} className="toggle-button">
          {isLogin ? '立即注册' : '立即登录'}
        </button>
      </div>
    </div>
  );
};

export default Login;