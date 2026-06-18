import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export type ThemeName = 'night' | 'sunrise' | 'forest' | 'ocean' | 'minimal';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

const themes: Record<ThemeName, ThemeColors> = {
  night: {
    primary: '#7c3aed',
    primaryLight: '#a78bfa',
    primaryDark: '#5b21b6',
    secondary: '#f0abfc',
    accent: '#c084fc',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
    surface: 'rgba(30, 27, 75, 0.85)',
    text: '#f5f3ff',
    textSecondary: '#c4b5fd',
    border: 'rgba(139, 92, 246, 0.3)',
  },
  sunrise: {
    primary: '#f97316',
    primaryLight: '#fdba74',
    primaryDark: '#c2410c',
    secondary: '#fde047',
    accent: '#fb923c',
    background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fef3c7 100%)',
    surface: 'rgba(255, 255, 255, 0.85)',
    text: '#431407',
    textSecondary: '#9a3412',
    border: 'rgba(249, 115, 22, 0.2)',
  },
  forest: {
    primary: '#16a34a',
    primaryLight: '#4ade80',
    primaryDark: '#166534',
    secondary: '#86efac',
    accent: '#22c55e',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 50%, #dcfce7 100%)',
    surface: 'rgba(255, 255, 255, 0.85)',
    text: '#052e16',
    textSecondary: '#166534',
    border: 'rgba(22, 163, 74, 0.2)',
  },
  ocean: {
    primary: '#0ea5e9',
    primaryLight: '#38bdf8',
    primaryDark: '#0369a1',
    secondary: '#7dd3fc',
    accent: '#38bdf8',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #bae6fd 50%, #e0f2fe 100%)',
    surface: 'rgba(255, 255, 255, 0.85)',
    text: '#0c4a6e',
    textSecondary: '#0369a1',
    border: 'rgba(14, 165, 233, 0.2)',
  },
  minimal: {
    primary: '#525252',
    primaryLight: '#a3a3a3',
    primaryDark: '#262626',
    secondary: '#d4d4d4',
    accent: '#737373',
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 50%, #fafafa 100%)',
    surface: 'rgba(255, 255, 255, 0.9)',
    text: '#171717',
    textSecondary: '#525252',
    border: 'rgba(0, 0, 0, 0.1)',
  },
};

interface ThemeContextType {
  theme: ThemeName;
  colors: ThemeColors;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<ThemeName>('ocean');

  const setTheme = async (newTheme: ThemeName) => {
    setThemeState(newTheme);
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        await axios.put(`/api/users/${userId}/theme`, { theme: newTheme });
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const colors = themes[theme] || themes.ocean;
    
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-light', colors.primaryLight);
    root.style.setProperty('--color-primary-dark', colors.primaryDark);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-border', colors.border);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, colors: themes[theme], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { themes };
