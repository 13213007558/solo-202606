import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
            🎵 音乐作品集
          </Link>

          <div className="navbar-links">
            <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
              首页
            </Link>
            <Link to="/performances" className={`navbar-link ${isActive('/performances') ? 'active' : ''}`}>
              演出
            </Link>
            {user ? (
              <>
                <Link to="/create" className="btn btn-primary">
                  + 发布作品
                </Link>
                <Link to="/profile" className="navbar-link">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="user-avatar">{user.username.charAt(0)}</div>
                    <span>{user.username}</span>
                  </div>
                </Link>
                <button className="navbar-link" onClick={handleLogout}>
                  退出
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-link">
                  登录
                </Link>
                <Link to="/register" className="btn btn-primary">
                  注册
                </Link>
              </>
            )}
          </div>

          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
            <span style={{ opacity: menuOpen ? 0 : 1 }}></span>
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
          </div>
        </div>
      </nav>

      <div className={`overlay ${menuOpen ? 'show' : ''}`} onClick={() => setMenuOpen(false)}></div>
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
          首页
        </Link>
        <Link to="/performances" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
          演出
        </Link>
        {user ? (
          <>
            <Link to="/create" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
              发布作品
            </Link>
            <Link to="/profile" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
              个人中心
            </Link>
            <button
              className="mobile-menu-link"
              style={{ textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={handleLogout}
            >
              退出登录
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
              登录
            </Link>
            <Link to="/register" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
              注册
            </Link>
          </>
        )}
      </div>
    </>
  );
}
