import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';

const Navbar = () => {
  const { user, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">社区网站</Link>
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
              <Link to="/register" className="navbar-link">注册</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;