export const theme = {
  colors: {
    primary: '#E07A2F',
    primaryLight: '#F5A962',
    primaryDark: '#C65D1A',
    background: '#FFF8F0',
    card: '#FFFFFF',
    text: '#333333',
    textLight: '#666666',
    border: '#E8E0D5',
    success: '#4CAF50',
    error: '#F44336',
    star: '#FFC107',
  },
  borderRadius: {
    sm: '6px',
    md: '12px',
    lg: '20px',
  },
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
  transitions: {
    fast: '0.2s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
  },
};

export type Theme = typeof theme;
