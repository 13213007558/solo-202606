import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ThemeName } from '../types';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes: Record<ThemeName, { primary: string; secondary: string; accent: string; bgStart: string; bgEnd: string }> = {
  'night-purple': {
    primary: '#7c3aed',
    secondary: '#a855f7',
    accent: '#c084fc',
    bgStart: '#f5f3ff',
    bgEnd: '#ede9fe',
  },
  'dawn-orange': {
    primary: '#ea580c',
    secondary: '#f97316',
    accent: '#fb923c',
    bgStart: '#fff7ed',
    bgEnd: '#ffedd5',
  },
  'forest-green': {
    primary: '#16a34a',
    secondary: '#22c55e',
    accent: '#4ade80',
    bgStart: '#f0fdf4',
    bgEnd: '#dcfce7',
  },
  'ocean-blue': {
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    bgStart: '#eff6ff',
    bgEnd: '#dbeafe',
  },
  'minimal-gray': {
    primary: '#4b5563',
    secondary: '#6b7280',
    accent: '#9ca3af',
    bgStart: '#f9fafb',
    bgEnd: '#f3f4f6',
  },
};

export function ThemeProvider({ children, initialTheme = 'night-purple' }: { children: ReactNode; initialTheme?: ThemeName }) {
  const [theme, setThemeState] = useState<ThemeName>(initialTheme);

  useEffect(() => {
    const themeConfig = themes[theme];
    document.documentElement.style.setProperty('--primary-color', themeConfig.primary);
    document.documentElement.style.setProperty('--secondary-color', themeConfig.secondary);
    document.documentElement.style.setProperty('--accent-color', themeConfig.accent);
    document.documentElement.style.setProperty('--bg-start', themeConfig.bgStart);
    document.documentElement.style.setProperty('--bg-end', themeConfig.bgEnd);
  }, [theme]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { themes };
