import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, clearError } from '../redux/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
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
    dispatch(login(formData));
  };
  
  return (
    <div className="login-container">
      <h1>登录</h1>
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => dispatch(clearError())}>关闭</button>
        </div>
      )}
      <form onSubmit={handleSubmit}>
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
          {isLoading ? '登录中...' : '登录'}
        </button>
      </form>
      <p>还没有账号？<a href="/register">注册</a></p>
    </div>
  );
};

export default Login;