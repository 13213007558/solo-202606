import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import RecipeDetail from './pages/RecipeDetail';
import ChallengeDetail from './pages/ChallengeDetail';
import RecipeEditor from './pages/RecipeEditor';

interface User {
  id: string;
  username: string;
  avatar: string;
  bio: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('weidao_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('weidao_user', JSON.stringify(userData));
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('weidao_user');
    navigate('/login');
  };

  const navLinks = user
    ? [
        { to: '/', label: '首页' },
        { to: `/profile/${user.id}`, label: '我的食谱' },
      ]
    : [
        { to: '/login', label: '登录' },
        { to: '/register', label: '注册' },
      ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          🍳 味道社区
        </Link>

        <div className="navbar-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={isActive(link.to) ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <div className="navbar-user">
              <Link to={`/profile/${user.id}`}>
                <img src={user.avatar} alt={user.username} className="navbar-avatar" />
              </Link>
              <button onClick={handleLogout} style={{ background: 'none', color: '#fff8e7', fontSize: '0.9rem' }}>
                退出
              </button>
            </div>
          )}
        </div>

        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <>
              <Link
                to={`/profile/${user.id}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                个人中心
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                style={{ background: 'none', color: '#fff8e7', textAlign: 'left', padding: '10px 0', fontSize: '1rem' }}
              >
                退出登录
              </button>
            </>
          )}
        </div>
      )}

      <div className="container">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="/profile/:id" element={<Profile currentUser={user} />} />
          <Route path="/recipe/:id" element={<RecipeDetail user={user} />} />
          <Route path="/challenge/:id" element={<ChallengeDetail user={user} />} />
          <Route path="/add-recipe" element={<RecipeEditor user={user} />} />
          <Route path="/edit-recipe/:id" element={<RecipeEditor user={user} />} />
        </Routes>
      </div>

      {user && (
        <Link to="/add-recipe" className="add-recipe-btn" title="添加菜谱">
          +
        </Link>
      )}
    </div>
  );
}

export default App;
