import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  ReactNode
} from 'react';
import {
  Routes,
  Route,
  NavLink,
  useNavigate,
  Navigate,
  useLocation
} from 'react-router-dom';
import type { SafeUser } from './types';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import RecipeDetail from './pages/RecipeDetail';
import ChallengeDetail from './pages/ChallengeDetail';
import MyRecipes from './pages/MyRecipes';

interface AuthContextValue {
  user: SafeUser | null;
  login: (u: SafeUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

interface ToastType {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const RequireAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          <span className="navbar-logo-icon">🍳</span>
          <span>味道社区</span>
        </NavLink>

        <div className="navbar-menu">
          <NavLink to="/" end className={({ isActive }) =>
            'navbar-link' + (isActive ? ' active' : '')
          }>
            🏠 社区首页
          </NavLink>
          {user && (
            <>
              <NavLink to="/recipes" className={({ isActive }) =>
                'navbar-link' + (isActive ? ' active' : '')
              }>
                📖 我的食谱
              </NavLink>
              <NavLink to={`/profile/${user.id}`} className={({ isActive }) =>
                'navbar-link' + (isActive ? ' active' : '')
              }>
                👤 个人档案
              </NavLink>
            </>
          )}
        </div>

        <div className="navbar-user">
          {user ? (
            <>
              <NavLink to={`/profile/${user.id}`} style={{ display: 'flex' }}>
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="navbar-avatar"
                />
              </NavLink>
              <button className="navbar-btn" onClick={handleLogout}>
                退出
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="navbar-link">
                登录
              </NavLink>
              <NavLink to="/register" className="navbar-btn">
                注册
              </NavLink>
            </>
          )}
          <button
            className="hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="菜单"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
      <div className={'mobile-menu' + (mobileOpen ? ' open' : '')}>
        <NavLink to="/" end className="navbar-link">
          🏠 社区首页
        </NavLink>
        {user && (
          <>
            <NavLink to="/recipes" className="navbar-link">
              📖 我的食谱
            </NavLink>
            <NavLink to={`/profile/${user.id}`} className="navbar-link">
              👤 个人档案
            </NavLink>
          </>
        )}
        {!user && (
          <>
            <NavLink to="/login" className="navbar-link">
              登录
            </NavLink>
            <NavLink to="/register" className="navbar-link">
              注册
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

const ToastContainer: React.FC<{ toasts: ToastType[] }> = ({ toasts }) => (
  <>
    {toasts.map((t) => (
      <div key={t.id} className={`toast ${t.type}`}>
        {t.message}
      </div>
    ))}
  </>
);

const App: React.FC = () => {
  const [user, setUser] = useState<SafeUser | null>(() => {
    try {
      const saved = localStorage.getItem('taste_user');
      return saved ? (JSON.parse(saved) as SafeUser) : null;
    } catch {
      return null;
    }
  });

  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('taste_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('taste_user');
    }
  }, [user]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2800);
    },
    []
  );

  const login = useCallback((u: SafeUser) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <ToastContext.Provider value={{ showToast }}>
        <Navbar />
        <ToastContainer toasts={toasts} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/recipes"
            element={
              <RequireAuth>
                <MyRecipes />
              </RequireAuth>
            }
          />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/challenge/:id" element={<ChallengeDetail />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
