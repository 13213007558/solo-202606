import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';

export type ThemeName = 'darkPurple' | 'dawnOrange' | 'forestGreen' | 'oceanBlue' | 'minimalGray';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  bg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  shadowColor: string;
}

const themes: Record<ThemeName, ThemeColors> = {
  darkPurple: {
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#6D28D9',
    bg: 'linear-gradient(135deg, #1a1025, #0f0a15)',
    cardBg: '#1e1530',
    cardBorder: '#2d2250',
    textPrimary: '#f3f0ff',
    textSecondary: '#a78bfa',
    shadowColor: 'rgba(139, 92, 246, 0.15)',
  },
  dawnOrange: {
    primary: '#F97316',
    primaryLight: '#FB923C',
    primaryDark: '#EA580C',
    bg: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
    cardBg: '#ffffff',
    cardBorder: '#fed7aa',
    textPrimary: '#1c1917',
    textSecondary: '#9a3412',
    shadowColor: 'rgba(249, 115, 22, 0.1)',
  },
  forestGreen: {
    primary: '#22C55E',
    primaryLight: '#4ADE80',
    primaryDark: '#16A34A',
    bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    cardBg: '#ffffff',
    cardBorder: '#bbf7d0',
    textPrimary: '#14532d',
    textSecondary: '#166534',
    shadowColor: 'rgba(34, 197, 94, 0.1)',
  },
  oceanBlue: {
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',
    bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    cardBg: '#ffffff',
    cardBorder: '#bfdbfe',
    textPrimary: '#1e3a5f',
    textSecondary: '#1e40af',
    shadowColor: 'rgba(59, 130, 246, 0.1)',
  },
  minimalGray: {
    primary: '#6B7280',
    primaryLight: '#9CA3AF',
    primaryDark: '#4B5563',
    bg: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
    cardBg: '#ffffff',
    cardBorder: '#e5e7eb',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    shadowColor: 'rgba(107, 114, 128, 0.1)',
  },
};

interface ThemeContextValue {
  themeName: ThemeName;
  theme: ThemeColors;
  switchTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyThemeToDOM(theme: ThemeColors): void {
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-light', theme.primaryLight);
  root.style.setProperty('--primary-dark', theme.primaryDark);
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--card-bg', theme.cardBg);
  root.style.setProperty('--card-border', theme.cardBorder);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--shadow-color', theme.shadowColor);
  root.style.transition = 'all 0.5s';
}

function getAuthHeaders(): Record<string, string> | undefined {
  const token = localStorage.getItem('token');
  if (!token) return undefined;
  return { Authorization: `Bearer ${token}` };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('oceanBlue');

  const theme = themes[themeName];

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  useEffect(() => {
    const headers = getAuthHeaders();
    if (!headers) return;
    axios
      .get('/api/user/theme', { headers })
      .then((res) => {
        const saved = res.data.theme as ThemeName;
        if (saved && themes[saved]) {
          setThemeName(saved);
        }
      })
      .catch(() => {});
  }, []);

  const switchTheme = useCallback(
    (name: ThemeName) => {
      if (!themes[name]) return;
      setThemeName(name);
      const headers = getAuthHeaders();
      if (headers) {
        axios.post('/api/user/theme', { theme: name }, { headers }).catch(() => {});
      }
    },
    []
  );

  return (
    <ThemeContext.Provider value={{ themeName, theme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
