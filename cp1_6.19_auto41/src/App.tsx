import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProjectDetailPage from './pages/ProjectDetailPage';

const navItems = [
  { path: '/', label: '看板', icon: '📊' },
  { path: '/projects', label: '项目列表', icon: '📁' },
  { path: '/settings', label: '设置', icon: '⚙️' },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <>
      {collapsed && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 998,
          }}
          onClick={onToggle}
        />
      )}
      <aside
        style={{
          width: collapsed ? '260px' : '240px',
          minWidth: collapsed ? '260px' : '240px',
          height: '100vh',
          background: '#1E293B',
          color: '#E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          position: collapsed ? 'fixed' : 'relative',
          left: 0,
          top: 0,
          zIndex: 999,
          transition: 'transform 0.3s ease',
        }}
      >
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '28px' }}>🚀</span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#F8FAFC' }}>
            DevHub
          </span>
        </div>

        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                color: isActive ? '#F8FAFC' : '#94A3B8',
                background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                transition: 'all 0.2s ease',
                fontSize: '15px',
                fontWeight: isActive ? 600 : 400,
              })}
              onClick={() => {
                if (collapsed) onToggle();
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #334155',
            fontSize: '13px',
            color: '#64748B',
          }}
        >
          DevHub v1.0
        </div>
      </aside>
    </>
  );
}

function MobileHeader({ onToggle }: { onToggle: () => void }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#1E293B',
        color: '#F8FAFC',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '22px' }}>🚀</span>
        <span style={{ fontSize: '18px', fontWeight: 700 }}>DevHub</span>
      </div>
      <button
        onClick={onToggle}
        style={{
          color: '#F8FAFC',
          fontSize: '24px',
          padding: '4px 8px',
          borderRadius: '6px',
        }}
      >
        ☰
      </button>
    </header>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {!isMobile && <Sidebar collapsed={false} onToggle={() => {}} />}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#F8FAFC',
        }}
      >
        {isMobile && <MobileHeader onToggle={() => setSidebarOpen(!sidebarOpen)} />}
        {isMobile && sidebarOpen && (
          <Sidebar
            collapsed={sidebarOpen}
            onToggle={() => setSidebarOpen(false)}
          />
        )}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '16px' : '32px',
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<HomePage showProjects />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>设置</h1>
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <p style={{ color: '#64748B' }}>应用设置功能即将上线...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
