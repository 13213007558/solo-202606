import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">TF</span>
        <span className="navbar-title">TeamFlow</span>
      </div>
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>看板</NavLink>
        <NavLink to="/review" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>代码审查</NavLink>
        <NavLink to="/stats" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>统计看板</NavLink>
      </div>
      <div className="navbar-user">
        <span className="user-name">{user?.username}</span>
        <button className="btn-logout" onClick={handleLogout}>退出</button>
      </div>
    </nav>
  );
};

export default Navbar;
