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

const PasswordStrength = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
`;

const StrengthBar = styled.div<{ filled: boolean }>`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: ${(props) => (props.filled ? theme.colors.primary : theme.colors.border)};
  transition: background ${theme.transitions.fast};
`;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const getPasswordStrength = () => {
    if (password.length < 4) return 0;
    if (password.length < 6) return 1;
    if (password.length >= 6 && /[A-Za-z]/.test(password) && /[0-9]/.test(password)) return 3;
    if (password.length >= 6) return 2;
    return 0;
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('请填写完整信息');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    try {
      setSubmitting(true);
      const response = await authApi.register({
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '注册失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Card>
        <PageTitle>🎉 加入我们</PageTitle>
        <PageSubtitle>创建账号，开始分享美食</PageSubtitle>

        {error && <ErrorText>{error}</ErrorText>}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>用户名</Label>
            <Input
              type="text"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormGroup>

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
              placeholder="请输入密码（至少6位）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {password && (
              <PasswordStrength>
                <StrengthBar filled={strength >= 1} />
                <StrengthBar filled={strength >= 2} />
                <StrengthBar filled={strength >= 3} />
              </PasswordStrength>
            )}
          </FormGroup>

          <FormGroup>
            <Label>确认密码</Label>
            <Input
              type="password"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormGroup>

          <Button type="submit" disabled={submitting}>
            {submitting ? '注册中...' : '注册'}
          </Button>
        </form>

        <FooterText>
          已有账号？<Link to="/login">立即登录</Link>
        </FooterText>
      </Card>
    </PageContainer>
  );
};

export default RegisterPage;
