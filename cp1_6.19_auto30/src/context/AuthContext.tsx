import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useTheme, ThemeName } from './ThemeContext';

const validThemes: ThemeName[] = ['night', 'sunrise', 'forest', 'ocean', 'minimal'];

const isValidTheme = (theme: any): theme is ThemeName => {
  return validThemes.includes(theme);
};

interface User {
  id: string;
  username: string;
  theme: string;
  stats: {
    totalWorks: number;
    totalLikes: number;
    totalComments: number;
    followers: number;
    weeklyLikes: number[];
  };
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (isValidTheme(parsedUser.theme)) {
        setTheme(parsedUser.theme);
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await axios.post('/api/auth/login', { username, password });
    const userData = response.data;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userId', userData.id);
    if (isValidTheme(userData.theme)) {
      setTheme(userData.theme);
    }
  };

  const register = async (username: string, password: string) => {
    const response = await axios.post('/api/auth/register', { username, password });
    const userData = response.data;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userId', userData.id);
    if (isValidTheme(userData.theme)) {
      setTheme(userData.theme);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
