import React, { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import './App.css';

const SettingsPage: React.FC = () => (
  <div>
    <h1 className="page-title">评伍</h1>
    <div className="card">
      <div className="section-title">功能从单</div>
      <p style={{ color: '#64748B', fontSize: 14 }}>���评伍评伍图标小程建议或对误－在评伍加载中...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', end: true, icon:import React, { useState } from 'react';
import { Routes, Route, NavLink } from$�i', label: '示事列表' },
    { to: '/settings', end: true, icon: '✋', label: '评伌' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">🛫 DevFlow</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <header className="mobile-header">
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? 'ȗr' : '⌗'}
        </button>
        <span style={{ fontWeight: 700, fontSize: 18 }}>🛻 DevFlow</span>
        <span style={{ width: 40 }}></span>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-menu open">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<HomePage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
