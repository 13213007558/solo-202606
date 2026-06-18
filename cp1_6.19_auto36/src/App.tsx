import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProjectPage from './pages/ProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

function RequireAuth({ children }: { children: JSX.Element }) {
  const loggedIn = localStorage.getItem('dpm_logged_in') === 'true';
  const location = useLocation();
  if (!loggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('dpm_logged_in');
    navigate('/login');
  };

  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <div>
      <div className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="菜单"
        >
          ☰
        </button>
        <div style={{ fontWeight: '700', fontSize: '16px' }}>DevProject</div>
        <div style={{ width: '32px' }} />
      </div>

      <div className="app-container">
        {mobileMenuOpen && (
          <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
        )}

        <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🚀</div>
            DevProject
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📊</span>
              项目看板
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📁</span>
              项目列表
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">⚙️</span>
              设置
            </NavLink>
          </nav>
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '12px' }}>
              {localStorage.getItem('dpm_username') || '未登录'}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}
              onClick={handleLogout}
            >
              退出登录
            </button>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <HomePage />
                </RequireAuth>
              }
            />
            <Route
              path="/projects"
              element={
                <RequireAuth>
                  <ProjectPage />
                </RequireAuth>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <RequireAuth>
                  <ProjectDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <SettingsPage />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
