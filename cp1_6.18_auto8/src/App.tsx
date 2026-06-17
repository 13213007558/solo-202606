import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { theme } from './theme';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CreateRecipePage from './pages/CreateRecipePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { wsClient } from './websocket';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: ${theme.colors.card};
  box-shadow: ${theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    opacity: 0.85;
    transition: opacity ${theme.transitions.fast};
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
  justify-content: center;

  @media (max-width: ${theme.breakpoints.mobile}) {
    display: none;
  }
`;

const NavLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>`
  padding: 8px 16px;
  border-radius: ${theme.borderRadius.sm};
  color: ${(props) => (props.active ? theme.colors.primary : theme.colors.text)};
  font-weight: ${(props) => (props.active ? 600 : 400)};
  background: ${(props) => (props.active ? `${theme.colors.primary}15` : 'transparent')};
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.primary}15;
    color: ${theme.colors.primary};
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const Username = styled.span`
  font-size: 14px;
  color: ${theme.colors.text};

  @media (max-width: ${theme.breakpoints.mobile}) {
    display: none;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'ghost' }>`
  padding: 8px 20px;
  border-radius: ${theme.borderRadius.sm};
  font-size: 14px;
  font-weight: 500;
  transition: all ${theme.transitions.fast};
  background: ${(props) =>
    props.variant === 'ghost' ? 'transparent' : theme.colors.primary};
  color: ${(props) => (props.variant === 'ghost' ? theme.colors.primary : '#fff')};
  border: ${(props) =>
    props.variant === 'ghost' ? `1px solid ${theme.colors.primary}` : 'none'};

  &:hover {
    background: ${(props) =>
      props.variant === 'ghost' ? `${theme.colors.primary}15` : theme.colors.primaryDark};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NotificationBadge = styled.div`
  position: fixed;
  top: 80px;
  right: 24px;
  background: ${theme.colors.card};
  border-left: 4px solid ${theme.colors.primary};
  padding: 12px 20px;
  border-radius: ${theme.borderRadius.sm};
  box-shadow: ${theme.shadows.lg};
  z-index: 1000;
  animation: slideIn 0.3s ease;
  max-width: 320px;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const Main = styled.main`
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
`;

const App: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notification, setNotification] = useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;

    const handleNewComment = (data: any) => {
      setNotification(
        `您的食谱《${data.recipeTitle}》收到了新评论：${data.comment.content}`
      );
      setTimeout(() => setNotification(null), 5000);
    };

    wsClient.on('new_comment', handleNewComment);

    return () => {
      wsClient.off('new_comment', handleNewComment);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppContainer>
      <Header>
        <Nav>
          <Logo to="/">🍳 食谱分享</Logo>

          <NavLinks>
            <NavLink to="/" active={isActive('/')}>
              食谱广场
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/create" active={isActive('/create')}>
                发布食谱
              </NavLink>
            )}
          </NavLinks>

          <UserSection>
            {isAuthenticated && user ? (
              <UserInfo>
                <Avatar src={user.avatar} alt={user.username} />
                <Username>{user.username}</Username>
                <Button variant="ghost" onClick={handleLogout}>
                  退出
                </Button>
              </UserInfo>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  登录
                </Button>
                <Button onClick={() => navigate('/register')}>注册</Button>
              </>
            )}
          </UserSection>
        </Nav>
      </Header>

      {notification && <NotificationBadge>{notification}</NotificationBadge>}

      <Main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/create" element={<CreateRecipePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Main>
    </AppContainer>
  );
};

export default App;
