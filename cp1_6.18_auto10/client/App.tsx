import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

const ColorEditor = lazy(() => import('./ColorEditor'));
const PaletteGallery = lazy(() => import('./pages/PaletteGallery'));
const PaletteDetail = lazy(() => import('./pages/PaletteDetail'));

function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/gallery') return location.pathname.startsWith('/gallery') || location.pathname.startsWith('/palette');
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-dot"></span>
          ColorLab
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            编辑器
          </Link>
          <Link to="/gallery" className={`nav-link ${isActive('/gallery') ? 'active' : ''}`}>
            方案广场
          </Link>
        </div>
      </div>
    </nav>
  );
}

function LoadingFallback() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>加载中...</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<ColorEditor />} />
              <Route path="/gallery" element={<PaletteGallery />} />
              <Route path="/palette/:id" element={<PaletteDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
