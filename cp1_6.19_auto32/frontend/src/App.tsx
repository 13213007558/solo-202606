import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

const appStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#1a202c',
  color: '#e2e8f0',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 32px',
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(0,212,255,0.15)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const logoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: 22,
  fontWeight: 700,
  color: '#00d4ff',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: 24,
};

const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
  color: isActive ? '#00d4ff' : '#a0aec0',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 400,
  fontSize: 15,
  transition: 'color 0.2s',
});

function App() {
  return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <div style={logoStyle}>
          <span style={{ fontSize: 28 }}>⚡</span>
          <span>家庭节能仪表盘</span>
        </div>
        <nav style={navStyle}>
          <NavLink
            to="/"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            仪表盘
          </NavLink>
          <NavLink
            to="/devices"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            设备管理
          </NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
