import React, { useState, useEffect, createContext, useContext, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import type { User, Notification } from '../api/events';
import { fetchNotifications, markNotificationsRead } from '../api/events';

const Home = lazy(() => import('./home'));
const Profile = lazy(() => import('./profile'));
const EventDetail = lazy(() => import('./event-detail'));
const Login = lazy(() => import('./login'));
const Register = lazy(() => import('./register'));

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  notifications: Notification[];
  refreshNotifications: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  notifications: [],
  refreshNotifications: () => {},
});

export const useAuth = () => useContext(AuthContext);

const Navbar: React.FC = () => {
  const { user, setUser, notifications, refreshNotifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
    setShowMenu(false);
  };

  const handleNotificationClick = async () => {
    if (user) {
      await markNotificationsRead(user.id);
      refreshNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">绿动社区</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            活动墙
          </Link>
          {user ? (
            <>
              <button
                className="nav-notification-btn"
                onClick={handleNotificationClick}
              >
                🔔
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">通知</div>
                  {notifications.length === 0 ? (
                    <div className="notification-empty">暂无通知</div>
                  ) : (
                    <div className="notification-list">
                      {notifications.slice(0, 5).map(n => (
                        <div key={n.id} className={`notification-item ${n.read ? 'read' : ''}`}>
                          <div className="notification-icon">
                            {n.type === 'badge' ? '🏅' : n.type === 'hours' ? '⏱️' : '📢'}
                          </div>
                          <div className="notification-content">
                            <div className="notification-title">{n.title}</div>
                            <div className="notification-message">{n.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="nav-user-menu">
                <button
                  className="nav-user-btn"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <span className="user-avatar">{user.avatar}</span>
                  <span className="user-name">{user.username}</span>
                </button>
                {showMenu && (
                  <div className="user-dropdown">
                    <Link to="/profile" onClick={() => setShowMenu(false)}>
                      个人主页
                    </Link>
                    <button onClick={handleLogout}>退出登录</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="nav-link">登录</Link>
              <Link to="/register" className="nav-btn">注册</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const refreshNotifications = async () => {
    if (user) {
      try {
        const data = await fetchNotifications(user.id);
        setNotifications(data);
      } catch (e) {
        console.error('获取通知失败', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, notifications, refreshNotifications }}>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Suspense fallback={<div className="loading">加载中...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/event/:id" element={<EventDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);

const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #fff;
    color: #333;
    line-height: 1.6;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .navbar {
    background: linear-gradient(135deg, #2D6B3B 0%, #1e4a29 100%);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: #fff;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .logo-icon {
    font-size: 1.5rem;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .nav-link {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-size: 0.95rem;
    transition: color 0.2s;
  }

  .nav-link:hover,
  .nav-link.active {
    color: #fff;
  }

  .nav-btn {
    background: #D4A76A;
    color: #2D6B3B;
    padding: 8px 20px;
    border-radius: 20px;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.9rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .nav-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(212, 167, 106, 0.4);
  }

  .nav-auth {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .nav-user-menu {
    position: relative;
  }

  .nav-user-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 20px;
    transition: background 0.2s;
  }

  .nav-user-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }

  .user-name {
    font-size: 0.9rem;
  }

  .user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    min-width: 140px;
    margin-top: 8px;
    overflow: hidden;
  }

  .user-dropdown a,
  .user-dropdown button {
    display: block;
    width: 100%;
    padding: 12px 16px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    font-size: 0.9rem;
    color: #333;
    text-decoration: none;
    transition: background 0.2s;
  }

  .user-dropdown a:hover,
  .user-dropdown button:hover {
    background: #f5f5f5;
  }

  .nav-notification-btn {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 4px 8px;
    color: #fff;
  }

  .notification-badge {
    position: absolute;
    top: 0;
    right: 0;
    background: #e74c3c;
    color: #fff;
    font-size: 0.7rem;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
  }

  .notification-dropdown {
    position: absolute;
    top: 64px;
    right: 120px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 320px;
    max-height: 400px;
    overflow-y: auto;
    z-index: 200;
  }

  .notification-header {
    padding: 14px 16px;
    font-weight: 600;
    border-bottom: 1px solid #eee;
    color: #2D6B3B;
  }

  .notification-empty {
    padding: 30px;
    text-align: center;
    color: #999;
    font-size: 0.9rem;
  }

  .notification-list {
    padding: 8px 0;
  }

  .notification-item {
    display: flex;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid #f5f5f5;
  }

  .notification-item:last-child {
    border-bottom: none;
  }

  .notification-item.read {
    opacity: 0.6;
  }

  .notification-icon {
    font-size: 1.2rem;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #e8f5e9;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .notification-content {
    flex: 1;
  }

  .notification-title {
    font-weight: 500;
    font-size: 0.9rem;
    margin-bottom: 2px;
  }

  .notification-message {
    font-size: 0.8rem;
    color: #666;
  }

  .main-content {
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 30px 20px;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #666;
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    .nav-container {
      padding: 0 16px;
    }

    .nav-links {
      gap: 12px;
    }

    .user-name {
      display: none;
    }

    .notification-dropdown {
      right: 16px;
      width: calc(100% - 32px);
    }

    .main-content {
      padding: 20px 16px;
    }
  }
`;

const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);
