import { useState, useEffect } from 'react';
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
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, token } = useSelector(state => state.auth);
  
  // 获取登录前的路径
  const from = location.state?.from?.pathname || '/';
  
  // 处理成功消息
  useEffect(() => {
    if (token && successMessage) {
      if (successMessage === '注册成功') {
        setShowSuccessModal(true);
      } else {
        // 登录成功，跳转到之前的页面
        navigate(from, { replace: true });
      }
    }
  }, [token, successMessage, navigate, from]);
  
  // 如果已经登录，跳转到之前的页面
  if (token && !successMessage) {
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
      dispatch(login({ email: formData.email, password: formData.password }))
        .unwrap()
        .then((response) => {
          if (response.message) {
            setSuccessMessage(response.message);
          }
        })
        .catch(() => {
          // 错误已经由redux处理
        });
    } else {
      dispatch(register(formData))
        .unwrap()
        .then((response) => {
          if (response.message) {
            setSuccessMessage(response.message);
          }
        })
        .catch(() => {
          // 错误已经由redux处理
        });
    }
  };
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: ''
    });
    setSuccessMessage('');
    setShowSuccessModal(false);
  };
  
  const handleModalClose = () => {
    setShowSuccessModal(false);
    setIsLogin(true);
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
              placeholder="请设置您的用户名"
              style={{ color: '#f44336' }}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">{isLogin ? '账户' : '邮箱'}</label>
          <input
            type={isLogin ? "text" : "email"}
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={isLogin ? "请输入用户名或邮箱" : "请输入邮箱 请设置您的邮箱"}
            style={{ color: '#f44336' }}
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
            placeholder={isLogin ? "请输入密码" : "请设置6-12位密码，至少包含字母，数字两种类型"}
            style={{ color: '#f44336' }}
            required
          />
        </div>
        <button type="submit" disabled={isLoading} style={{ backgroundColor: '#3a506b', borderRadius: '8px', padding: '12px', fontSize: '16px', fontWeight: '600' }}>
          {isLoading ? (isLogin ? '登录中...' : '注册中...') : (isLogin ? '登录' : '注册')}
        </button>
      </form>
      <div className="form-toggle">
        <p>{isLogin ? '还没有账号？' : '已有账号？'}</p>
        <button onClick={toggleForm} className="toggle-button" style={{ border: '2px solid #3a506b', borderRadius: '25px', padding: '10px 20px' }}>
          {isLogin ? '立即注册' : '立即登录'}
        </button>
      </div>
      
      {/* 成功弹窗 */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{successMessage}</h2>
            <p>立即登录</p>
            <button onClick={handleModalClose} className="modal-button">
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;