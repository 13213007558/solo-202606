import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Challenges from './pages/Challenges';
import Profile from './pages/Profile';

export default function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <NavLink to="/" className="nav-logo">
            📚 个人阅读书架
          </NavLink>
          <ul className="nav-links">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end
              >
                书架
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/challenges" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                挑战
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/profile" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                个人主页
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}
