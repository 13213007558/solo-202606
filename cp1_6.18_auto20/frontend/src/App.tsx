import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent";
import EventDetail from "./pages/EventDetail";
import "./App.css";

function App() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <nav className="navbar glass">
        <div className="nav-content">
          <Link to="/" className="nav-brand">
            <span className="logo-icon">🎉</span>
            <span className="logo-text">节日活动</span>
          </Link>
          <div className="nav-actions">
            <button
              className="btn btn-primary ripple-btn"
              onClick={() => navigate("/create")}
            >
              + 创建活动
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/event/:id" element={<EventDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
