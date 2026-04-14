import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { useState } from 'react';

const Navbar = () => {
  const { user, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };
  
  const confirmLogout = () => {
    dispatch(logout());
    setShowLogoutConfirm(false);
    navigate('/');
  };
  
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">社区</Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">首页</Link>
          <Link to="/recommended" className="navbar-link">推荐</Link>
          {token ? (
            <>
              <Link to="/profile" className="navbar-link">个人主页</Link>
              <button onClick={handleLogout} className="navbar-button">登出</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">登录</Link>
            </>
          )}
        </div>
      </div>
      
      {/* 登出确认弹窗 */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>确认登出</h2>
            <p>您确定要退出账号吗？</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button 
                onClick={cancelLogout} 
                className="modal-button" 
                style={{ background: 'var(--text-muted)', marginRight: '1rem' }}
              >
                取消
              </button>
              <button 
                onClick={confirmLogout} 
                className="modal-button"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
