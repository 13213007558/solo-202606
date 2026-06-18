import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import AuctionCard from './components/AuctionCard';
import LoginForm from './components/LoginForm';
import CreateItem from './components/CreateItem';
import AuctionDetail from './components/AuctionDetail';

interface User {
  id: string;
  username: string;
  avatar?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const SocketContext = createContext<Socket | null>(null);
const AuthContext = createContext<AuthContextType | null>(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) throw new Error('useSocket must be used within App');
  return socket;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within App');
  return ctx;
};

const NAVBAR_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  height: 60,
  backgroundColor: '#1A202C',
  borderBottom: '3px solid #D69E2E',
  boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
};

const LOGO_STYLE: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: '#D69E2E',
  textDecoration: 'none',
  letterSpacing: 1,
};

const NAV_RIGHT_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const BTN_STYLE: React.CSSProperties = {
  padding: '8px 18px',
  borderRadius: 6,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  transition: 'opacity 0.2s',
};

const GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 24,
  padding: '32px 24px',
  maxWidth: 1200,
  margin: '0 auto',
};

const PAGE_BG: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#1A202C',
  color: '#F7FAFC',
  fontFamily: "'Segoe UI', sans-serif",
};

function HomePage() {
  const [items, setItems] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/items?status=active')
      .then((r) => r.json())
      .then((data) => setItems(data))
      .catch(() => {});
  }, []);

  return (
    <div style={PAGE_BG}>
      <nav style={NAVBAR_STYLE}>
        <Link to="/" style={LOGO_STYLE}>⚜ 珍品拍卖行</Link>
        <div style={NAV_RIGHT_STYLE}>
          {user ? (
            <>
              <Link to="/create">
                <button style={{ ...BTN_STYLE, backgroundColor: '#D69E2E', color: '#1A202C' }}>
                  发布拍卖
                </button>
              </Link>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: '#4A5568',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D69E2E',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title={user.username}
              >
                {user.username[0].toUpperCase()}
              </div>
            </>
          ) : (
            <Link to="/login">
              <button style={{ ...BTN_STYLE, backgroundColor: '#D69E2E', color: '#1A202C' }}>
                登录
              </button>
            </Link>
          )}
        </div>
      </nav>
      <main style={GRID_STYLE}>
        {items.map((item) => (
          <AuctionCard key={item.id} item={item} onClick={() => navigate(`/item/${item.id}`)} />
        ))}
      </main>
    </div>
  );
}

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUserRaw] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('auction_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const s = io(window.location.origin + '/socket.io');
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  const setUser = useCallback((u: User | null) => {
    if (u) {
      localStorage.setItem('auction_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('auction_user');
    }
    setUserRaw(u);
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      <AuthContext.Provider value={{ user, setUser }}>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/create" element={<CreateItem />} />
            <Route path="/item/:id" element={<AuctionDetail />} />
          </Routes>
        </Router>
      </AuthContext.Provider>
    </SocketContext.Provider>
  );
}
