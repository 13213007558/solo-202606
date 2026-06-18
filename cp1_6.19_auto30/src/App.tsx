import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import WorkDetailPage from './pages/WorkDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateWorkPage from './pages/CreateWorkPage';
import PerformancesPage from './pages/PerformancesPage';
import './styles/transitions.css';

function App() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fadeOut');
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  return (
    <div className="app">
      <Navbar />
      <main className={`page-transition ${transitionStage}`}>
        <Routes location={displayLocation}>
          <Route path="/" element={<HomePage />} />
          <Route path="/work/:id" element={<WorkDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create" element={<CreateWorkPage />} />
          <Route path="/edit/:id" element={<CreateWorkPage />} />
          <Route path="/performances" element={<PerformancesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
