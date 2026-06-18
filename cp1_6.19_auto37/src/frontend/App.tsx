import { Routes, Route, Link, Navigate } from 'react-router-dom';
import ActivityList from './pages/ActivityList';
import ActivityDetail from './pages/ActivityDetail';
import CreateActivity from './pages/CreateActivity';

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <Link to="/list" className="logo">
          <span className="logo-icon">❤</span>
          <span>爱心捐赠墙</span>
        </Link>
        <nav className="nav">
          <Link to="/list" className="btn btn-ghost">活动广场</Link>
          <Link to="/create" className="btn btn-primary">发起活动</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/list" replace />} />
        <Route path="/list" element={<ActivityList />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
        <Route path="/create" element={<CreateActivity />} />
      </Routes>
    </div>
  );
}

export default App;
