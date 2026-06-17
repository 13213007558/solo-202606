import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';

const PageContainer = styled.div`
  max-width: 420px;
  margin: 60px auto;
`;

const Card = styled.div`
  background: ${theme.colors.card};
  border-radius: ${theme.borderRadius.md};
  padding: 40px;
  box-shadow: ${theme.shadows.md};
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.text};
  text-align: center;
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  font-size: 14px;
  color: ${theme.colors.textLight};
  text-align: center;
  margin-bottom: 32px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.text};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  font-size: 14px;
  transition: border-color ${theme.transitions.normal};

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: ${theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background ${theme.transitions.fast};
  margin-top: 8px;

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  color: ${theme.colors.error};
  font-size: 13px;
  margin-bottom: 16px;
  text-align: center;
`;

const FooterText = styled.p`
  text-align: center;
  font-size: 14px;
  color: ${theme.colors.textLight};
  margin-top: 24px;

  a {
    color: ${theme.colors.primary};
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const DemoInfo = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.sm};
  padding: 12px;
  margin-bottom: 20px;
  font-size: 13px;
  color: ${theme.colors.textLight};
  text-align: center;

  strong {
    color: ${theme.colors.text};
  }
`;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('wang@example.com');
  const [password, setPassword] = useState('123456');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('请填写完整信息');
      return;
    }

    try {
      setSubmitting(true);
      const response = await authApi.login({
        email: email.trim(),
        password: password.trim(),
      });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Card>
        <PageTitle>👋 欢迎回来</PageTitle>
        <PageSubtitle>登录后解锁更多功能</PageSubtitle>

        <DemoInfo>
          <strong>演示账号：</strong> wang@example.com / 123456
        </DemoInfo>

        {error && <ErrorText>{error}</ErrorText>}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>邮箱</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>密码</Label>
            <Input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormGroup>

          <Button type="submit" disabled={submitting}>
            {submitting ? '登录中...' : '登录'}
          </Button>
        </form>

        <FooterText>
          还没有账号？<Link to="/register">立即注册</Link>
        </FooterText>
      </Card>
    </PageContainer>
  );
};

export default LoginPage;
