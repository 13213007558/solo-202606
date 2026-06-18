import { useTheme, themes } from '../context/ThemeContext';
import type { ThemeName } from '../types';

interface ThemeSelectorProps {
  onThemeChange?: (theme: ThemeName) => void;
}

const themeNames: Record<ThemeName, string> = {
  'night-purple': '暗夜紫',
  'dawn-orange': '晨曦橙',
  'forest-green': '森林绿',
  'ocean-blue': '海洋蓝',
  'minimal-gray': '极简灰',
};

export default function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        主题配色
      </p>
      <div className="theme-selector">
        {(Object.keys(themes) as ThemeName[]).map((t) => (
          <button
            key={t}
            className={`theme-btn ${theme === t ? 'active' : ''}`}
            style={{ background: themes[t].primary }}
            onClick={() => handleThemeChange(t)}
            title={themeNames[t]}
            aria-label={themeNames[t]}
          />
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
        当前: {themeNames[theme]}
      </p>
    </div>
  );
}
