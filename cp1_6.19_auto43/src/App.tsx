import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import type { User } from './types';
import Home from './pages/Home';
import ExhibitionDetail from './pages/ExhibitionDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('museum_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('museum_user');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">
            <span className="logo-icon">🏛️</span>
            <span className="logo-text">虚拟博物馆</span>
          </Link>
          <nav className="nav-links">
            <Link to="/" className="nav-link">首页</Link>
            {user ? (
              <>
                <Link to="/admin" className="nav-link">管理后台</Link>
                <span className="nav-user">欢迎, {user.username}</span>
                <button className="nav-btn logout" onClick={handleLogout}>
                  退出
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn">登录</Link>
                <Link to="/register" className="nav-btn primary">注册</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exhibition/:id" element={<ExhibitionDetail />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <p>© 2026 虚拟博物馆展览门票系统</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
