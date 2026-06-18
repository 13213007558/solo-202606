import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeName } from '../context/ThemeContext';
import '../styles/navbar.css';

const themeOptions: { name: ThemeName; label: string; color: string }[] = [
  { name: 'night', label: '暗夜紫', color: '#7c3aed' },
  { name: 'sunrise', label: '晨曦橙', color: '#f97316' },
  { name: 'forest', label: '森林绿', color: '#16a34a' },
  { name: 'ocean', label: '海洋蓝', color: '#0ea5e9' },
  { name: 'minimal', label: '极简灰', color: '#525252' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
    setShowThemeMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    setShowThemeMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎵</span>
          <span className="logo-text">音乐人作品集</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">首页</Link>
          <Link to="/performances" className="nav-link">演出</Link>
          {user && (
            <>
              <Link to="/create" className="nav-link">发布作品</Link>
              <Link to="/profile" className="nav-link">个人中心</Link>
            </>
          )}
          
          <div className="theme-selector">
            <button 
              className="theme-toggle-btn"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
            >
              <span 
                className="theme-dot" 
                style={{ background: themeOptions.find(t => t.name === theme)?.color }}
              ></span>
              主题
            </button>
            {showThemeMenu && (
              <div className="theme-dropdown">
                {themeOptions.map((t) => (
                  <button
                    key={t.name}
                    className={`theme-option ${theme === t.name ? 'active' : ''}`}
                    onClick={() => handleThemeChange(t.name)}
                  >
                    <span className="theme-dot" style={{ background: t.color }}></span>
                    <span>{t.label}</span>
                    {theme === t.name && <span className="checkmark">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="user-menu">
              <div className="avatar avatar-sm">{user.username.charAt(0).toUpperCase()}</div>
              <span className="username">{user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>退出</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">登录</Link>
              <Link to="/register" className="btn btn-primary">注册</Link>
            </div>
          )}
        </div>

        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`mobile-sidebar ${isMenuOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-content">
          <Link to="/" className="mobile-nav-link">首页</Link>
          <Link to="/performances" className="mobile-nav-link">演出</Link>
          {user && (
            <>
              <Link to="/create" className="mobile-nav-link">发布作品</Link>
              <Link to="/profile" className="mobile-nav-link">个人中心</Link>
            </>
          )}
          
          <div className="sidebar-section">
            <p className="sidebar-section-title">选择主题</p>
            <div className="mobile-theme-options">
              {themeOptions.map((t) => (
                <button
                  key={t.name}
                  className={`mobile-theme-btn ${theme === t.name ? 'active' : ''}`}
                  onClick={() => handleThemeChange(t.name)}
                >
                  <span className="theme-dot" style={{ background: t.color }}></span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {user ? (
            <div className="sidebar-user">
              <div className="user-info">
                <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
                <span>{user.username}</span>
              </div>
              <button className="btn btn-secondary w-full" onClick={handleLogout}>退出登录</button>
            </div>
          ) : (
            <div className="sidebar-auth">
              <Link to="/login" className="btn btn-secondary w-full mb-2">登录</Link>
              <Link to="/register" className="btn btn-primary w-full">注册</Link>
            </div>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMenuOpen(false)}></div>
      )}
    </nav>
  );
};

export default Navbar;
