import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Challenges from './pages/Challenges';
import Profile from './pages/Profile';

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-content">
          <NavLink to="/" className="navbar-logo">
            📚 阅读书架
          </NavLink>
          <div className="navbar-links">
            <NavLink to="/" className="navbar-link">书架</NavLink>
            <NavLink to="/challenges" className="navbar-link">挑战</NavLink>
            <NavLink to="/profile" className="navbar-link">个人主页</NavLink>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
