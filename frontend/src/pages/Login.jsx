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
  const [errors, setErrors] = useState({
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
  
  const from = location.state?.from?.pathname || '/';
  
  useEffect(() => {
    if (token && successMessage) {
      setShowSuccessModal(true);
    }
  }, [token, successMessage]);
  
  if (token && !successMessage) {
    navigate(from, { replace: true });
  }
  
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'username':
        if (!value.trim()) {
          error = '用户名不能为空';
        } else if (value.length < 3 || value.length > 20) {
          error = '用户名长度应在3-20个字符之间';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = '账户不能为空';
        } else if (!isLogin && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = '请输入有效的邮箱地址';
        }
        break;
      case 'password':
        if (!value) {
          error = '密码不能为空';
        } else if (value.length < 6 || value.length > 12) {
          error = '密码长度应在6-12个字符之间';
        } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/.test(value)) {
          error = '密码至少包含字母和数字';
        }
        break;
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return error === '';
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (value.trim()) {
      validateField(name, value);
    } else {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const isUsernameValid = isLogin || validateField('username', formData.username);
    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);
    
    if (!isEmailValid || !isPasswordValid || (!isLogin && !isUsernameValid)) {
      return;
    }
    
    if (isLogin) {
      dispatch(login({ email: formData.email, password: formData.password }))
        .unwrap()
        .then((response) => {
          if (response.message) {
            setSuccessMessage(response.message);
          }
        })
        .catch(() => {});
    } else {
      dispatch(register(formData))
        .unwrap()
        .then((response) => {
          if (response.message) {
            setSuccessMessage(response.message);
          }
        })
        .catch(() => {});
    }
  };
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: ''
    });
    setErrors({
      username: '',
      email: '',
      password: ''
    });
    setSuccessMessage('');
    setShowSuccessModal(false);
  };
  
  const handleModalClose = () => {
    setShowSuccessModal(false);
    if (token) {
      navigate(from, { replace: true });
    } else {
      setIsLogin(true);
      setFormData({
        username: '',
        email: '',
        password: ''
      });
      setErrors({
        username: '',
        email: '',
        password: ''
      });
    }
  };
  
  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <h1 className="auth-visual-title">社区</h1>
          <p className="auth-visual-subtitle">连接每一个声音</p>
        </div>
      </div>
      
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <h1 className="auth-form-logo">社区</h1>
          <p className="auth-form-tagline">开始你的旅程</p>
          
          <div className="auth-form">
            <h2 className="auth-form-title">{isLogin ? '欢迎回来' : '创建账号'}</h2>
            <p className="auth-form-subtitle">{isLogin ? '登录你的账号' : '加入我们的社区'}</p>
            
            {error && (
              <div className="error-message">
                {error}
                <button onClick={() => dispatch(clearError())} className="error-close">×</button>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="username" className="form-label">用户名</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="请设置您的用户名"
                    className={`form-input ${errors.username ? 'error' : ''}`}
                    required
                  />
                  {errors.username && (
                    <div className="error-text">{errors.username}</div>
                  )}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">{isLogin ? '账户' : '邮箱'}</label>
                <input
                  type={isLogin ? "text" : "email"}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={isLogin ? "请输入用户名或邮箱" : "请输入您的邮箱地址"}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  required
                />
                {errors.email && (
                  <div className="error-text">{errors.email}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">密码</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={isLogin ? "请输入密码" : "请设置6-12位密码"}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  required
                />
                {errors.password && (
                  <div className="error-text">{errors.password}</div>
                )}
                {!isLogin && (
                  <div className="password-hint">密码至少包含字母和数字</div>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading} 
                className="submit-button"
              >
                {isLoading ? (isLogin ? '登录中...' : '注册中...') : (isLogin ? '登录' : '注册')}
              </button>
            </form>
          </div>
          
          <div className="form-toggle">
            <p>{isLogin ? '还没有账号？' : '已有账号？'}</p>
            <button onClick={toggleForm} className="toggle-button">
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </div>
        </div>
      </div>
      
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">✓</div>
            <h2>{successMessage}</h2>
            <p>{successMessage === '注册成功' ? '立即登录' : '即将跳转...'}</p>
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
