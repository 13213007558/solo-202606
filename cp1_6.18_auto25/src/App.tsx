import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

export interface Device {
  id: string;
  name: string;
  type: string;
  power: number;
  dailyHours: number;
  todayEnergy?: number;
}

export interface Reading {
  deviceId: string;
  date: string;
  hours: number;
  energy: number;
}

export interface TrendPoint {
  date: string;
  label: string;
  energy: number;
}

export interface Overview {
  today: number;
  week: number;
  month: number;
  todayCompare: number;
  weekCompare: number;
  monthCompare: number;
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#1a202c',
        }}
      >
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 32px',
            backgroundColor: '#2d3748',
            borderBottom: '1px solid #4a5568',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#00ffff',
              textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
            }}
          >
            ⚡家庭能耗
          </div>
          <div style={{ display: 'flex', gap: '32px' }}>
            <Link
              to="/"
              style={{
                color: '#e2e8f0',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              首页
            </Link>
            <Link
              to="/devices"
              style={{
                color: '#e2e8f0',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              设备管理
            </Link>
            <Link
              to="/suggestions"
              style={{
                color: '#e2e8f0',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              节能建议
            </Link>
          </div>
        </nav>
        <main style={{ padding: '24px 32px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
