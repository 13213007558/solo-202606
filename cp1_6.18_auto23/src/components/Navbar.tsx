import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme, ThemeName } from '../context/ThemeContext';

const THEME_OPTIONS: { label: string; value: ThemeName; color: string }[] = [
  { label: '暗夜紫', value: 'darkPurple', color: '#8B5CF6' },
  { label: '晨曦橙', value: 'dawnOrange', color: '#F97316' },
  { label: '森林绿', value: 'forestGreen', color: '#22C55E' },
  { label: '海洋蓝', value: 'oceanBlue', color: '#3B82F6' },
  { label: '极简灰', value: 'minimalGray', color: '#6B7280' },
];

export default function Navbar() {
  const { theme, themeName, switchTheme } = useTheme();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('username');
    setToken(t);
    setUsername(u);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
    navigate('/');
    setDrawerOpen(false);
  };

  const handleThemeChange = (name: ThemeName) => {
    switchTheme(name);
    setThemeDropdownOpen(false);
  };

  const navLinks = [
    { label: '首页', path: '/' },
    { label: '作品广场', path: '/explore' },
  ];

  const authLinks = token
    ? [
        { label: '我的作品', path: '/my-works' },
        { label: '个人中心', path: '/profile' },
      ]
    : [];

  const allLinks = [...navLinks, ...authLinks];

  const styles = {
    navbar: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      height: 64,
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      backgroundColor: `${theme.primary}14`,
      borderBottom: `1px solid ${theme.cardBorder}`,
      transition: 'all 0.3s ease',
    } as React.CSSProperties,

    logo: {
      fontSize: 20,
      fontWeight: 700,
      color: theme.textPrimary,
      textDecoration: 'none',
      cursor: 'pointer',
      letterSpacing: 1,
      transition: 'color 0.3s ease',
    } as React.CSSProperties,

    navLinksContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 32,
    } as React.CSSProperties,

    navLink: {
      color: theme.textSecondary,
      textDecoration: 'none',
      fontSize: 15,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'color 0.2s ease',
      position: 'relative' as const,
    } as React.CSSProperties,

    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    } as React.CSSProperties,

    themeSelect: {
      position: 'relative' as const,
    } as React.CSSProperties,

    themeButton: {
      padding: '8px 14px',
      borderRadius: 8,
      border: `1px solid ${theme.cardBorder}`,
      backgroundColor: 'transparent',
      color: theme.textPrimary,
      fontSize: 14,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      transition: 'all 0.2s ease',
    } as React.CSSProperties,

    themeDot: {
      width: 14,
      height: 14,
      borderRadius: '50%',
      backgroundColor: theme.primary,
      flexShrink: 0,
    } as React.CSSProperties,

    themeDropdown: {
      position: 'absolute' as const,
      top: 'calc(100% + 8px)',
      right: 0,
      minWidth: 140,
      backgroundColor: theme.cardBg,
      border: `1px solid ${theme.cardBorder}`,
      borderRadius: 10,
      boxShadow: `0 8px 24px ${theme.shadowColor}`,
      overflow: 'hidden',
      zIndex: 1001,
    } as React.CSSProperties,

    themeOption: {
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      fontSize: 14,
      color: theme.textPrimary,
      transition: 'background-color 0.15s ease',
    } as React.CSSProperties,

    loginButton: {
      padding: '8px 20px',
      borderRadius: 8,
      backgroundColor: theme.primary,
      color: '#ffffff',
      textDecoration: 'none',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease',
    } as React.CSSProperties,

    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    } as React.CSSProperties,

    usernameText: {
      color: theme.textPrimary,
      fontSize: 14,
      fontWeight: 500,
    } as React.CSSProperties,

    logoutButton: {
      padding: '6px 14px',
      borderRadius: 8,
      border: `1px solid ${theme.cardBorder}`,
      backgroundColor: 'transparent',
      color: theme.textSecondary,
      fontSize: 13,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as React.CSSProperties,

    hamburgerButton: {
      width: 40,
      height: 40,
      borderRadius: 8,
      border: 'none',
      backgroundColor: 'transparent',
      color: theme.textPrimary,
      fontSize: 22,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease',
    } as React.CSSProperties,

    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1001,
      opacity: drawerOpen ? 1 : 0,
      transition: 'opacity 0.3s ease',
      pointerEvents: drawerOpen ? 'auto' : ('none' as const),
    } as React.CSSProperties,

    drawer: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      bottom: 0,
      width: 280,
      maxWidth: '85vw',
      backgroundColor: theme.cardBg,
      zIndex: 1002,
      transform: `translateX(${drawerOpen ? 0 : '-100%'})`,
      transition: 'transform 0.3s ease',
      display: 'flex',
      flexDirection: 'column' as const,
      borderRight: `1px solid ${theme.cardBorder}`,
      boxShadow: `8px 0 24px ${theme.shadowColor}`,
    } as React.CSSProperties,

    drawerHeader: {
      padding: '20px 20px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${theme.cardBorder}`,
    } as React.CSSProperties,

    drawerTitle: {
      fontSize: 18,
      fontWeight: 700,
      color: theme.textPrimary,
    } as React.CSSProperties,

    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 8,
      border: 'none',
      backgroundColor: 'transparent',
      color: theme.textPrimary,
      fontSize: 20,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease',
    } as React.CSSProperties,

    drawerBody: {
      flex: 1,
      padding: '16px 20px',
      overflowY: 'auto' as const,
    } as React.CSSProperties,

    drawerSection: {
      marginBottom: 24,
    } as React.CSSProperties,

    drawerSectionTitle: {
      fontSize: 12,
      fontWeight: 600,
      color: theme.textSecondary,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
      marginBottom: 12,
    } as React.CSSProperties,

    drawerNavLink: {
      display: 'block',
      padding: '12px 14px',
      borderRadius: 8,
      color: theme.textPrimary,
      textDecoration: 'none',
      fontSize: 15,
      fontWeight: 500,
      marginBottom: 4,
      transition: 'all 0.15s ease',
    } as React.CSSProperties,

    colorDotsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 12,
      padding: '4px 0',
    } as React.CSSProperties,

    colorDot: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      cursor: 'pointer',
      border: '3px solid transparent',
      transition: 'all 0.2s ease',
      padding: 0,
    } as React.CSSProperties,

    drawerFooter: {
      padding: '16px 20px 24px',
      borderTop: `1px solid ${theme.cardBorder}`,
    } as React.CSSProperties,

    drawerLoginButton: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: 10,
      backgroundColor: theme.primary,
      color: '#ffffff',
      textDecoration: 'none',
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      border: 'none',
      display: 'block',
      textAlign: 'center' as const,
      transition: 'all 0.2s ease',
    } as React.CSSProperties,

    drawerUserRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12,
    } as React.CSSProperties,

    drawerLogoutButton: {
      width: '100%',
      padding: '10px 16px',
      borderRadius: 10,
      border: `1px solid ${theme.cardBorder}`,
      backgroundColor: 'transparent',
      color: theme.textSecondary,
      fontSize: 14,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as React.CSSProperties,
  };

  const renderThemeSelector = () => (
    <div style={styles.themeSelect}>
      <button
        style={styles.themeButton}
        onClick={() => setThemeDropdownOpen((v) => !v)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${theme.primary}14`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <span style={styles.themeDot} />
        <span>{THEME_OPTIONS.find((t) => t.value === themeName)?.label}</span>
        <span style={{ fontSize: 10, marginLeft: 4 }}>▼</span>
      </button>
      {themeDropdownOpen && (
        <div style={styles.themeDropdown}>
          {THEME_OPTIONS.map((option) => (
            <div
              key={option.value}
              style={{
                ...styles.themeOption,
                backgroundColor: themeName === option.value ? `${theme.primary}14` : 'transparent',
              }}
              onClick={() => handleThemeChange(option.value)}
              onMouseEnter={(e) => {
                if (themeName !== option.value) {
                  e.currentTarget.style.backgroundColor = `${theme.primary}0D`;
                }
              }}
              onMouseLeave={(