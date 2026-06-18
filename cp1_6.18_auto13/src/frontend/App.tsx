import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import AuthModal from './components/AuthModal';
import './styles/global.css';

export interface User {
  id: string;
  username: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('bookreview_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('bookreview_user', JSON.stringify(userData));
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bookreview_user');
  };

  const openLogin = () => {
    setAuthMode('login');
    setShowAuth(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setShowAuth(true);
  };

  const switchMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-icon">📚</span>
            书迷阁
          </div>
          <div className="nav">
            {user ? (
              <div className="user-info">
                <span className="welcome-text">{user.username}</span>
                <button className="btn btn-ghost" onClick={handleLogout}>
                  退出
                </button>
              </div>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={openLogin}>
                  登录
                </button>
                <button className="btn btn-primary" onClick={openRegister}>
                  注册
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home user={user} onLogin={openLogin} />} />
          <Route
            path="/book/:id"
            element={<BookDetail user={user} onLogin={openLogin} />}
          />
        </Routes>
      </main>

      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSuccess={handleLoginSuccess}
          switchMode={switchMode}
        />
      )}
    </div>
  );
}

export default App;
