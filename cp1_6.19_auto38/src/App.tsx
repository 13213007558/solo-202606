import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import ExhibitionDetail from './pages/ExhibitionDetail';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './pages/AdminPanel';

interface User {
  id: string;
  username: string;
  role: string;
  museumName: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('museum_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('museum_user');
    setUser(null);
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header user={user} onLogout={handleLogout} />
        <main style={{ flex: 1, padding: '24px' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/exhibition/:id" element={<ExhibitionDetail />} />
            <Route path="/login" element={<LoginPage onLogin={setUser} />} />
            <Route path="/register" element={<RegisterPage onRegister={setUser} />} />
            <Route path="/admin" element={<AdminPanel user={user} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function Header({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const navigate = useNavigate();

  return (
    <header style={{
      backgroundColor: 'var(--bg-secondary)',
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'var(--accent-amber)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '28px' }}>🏛️</span>
        <span>虚拟博物馆</span>
      </Link>
      
      <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <Link to="/" style={{
          color: 'var(--text-primary)',
          fontSize: '14px',
          transition: 'color 0.2s',
        }}>
          展览广场
        </Link>
        
        {user ? (
          <>
            <Link to="/admin" style={{
              color: 'var(--text-primary)',
              fontSize: '14px',
              transition: 'color 0.2s',
            }}>
              管理后台
            </Link>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {user.museumName}
            </span>
            <button
              onClick={onLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-amber)';
                e.currentTarget.style.color = 'var(--accent-amber)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              退出
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              padding: '8px 16px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              transition: 'all 0.2s',
            }}>
              登录
            </Link>
            <Link to="/register" style={{
              padding: '8px 20px',
              backgroundColor: 'var(--accent-amber)',
              color: '#1A202C',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '6px',
              transition: 'background-color 0.2s',
            }}>
              注册
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      padding: '20px 24px',
      borderTop: '1px solid var(--border-color)',
      textAlign: 'center',
      color: 'var(--text-secondary)',
      fontSize: '13px',
    }}>
      <p>© 2026 虚拟博物馆展览门票系统 · 让艺术触手可及</p>
    </footer>
  );
}

export default App;
