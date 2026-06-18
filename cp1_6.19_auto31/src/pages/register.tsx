import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/events';
import { useAuth } from './main';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    setLoading(true);

    try {
      const data = await register(username, password);
      setUser(data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🌱</div>
          <h1>加入绿动社区</h1>
          <p>创建账号，开启环保之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
            />
          </div>

          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="请输入密码（至少6位）"
              required
            />
          </div>

          <div className="form-group">
            <label>确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="请再次输入密码"
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>

          <p className="auth-footer">
            已有账号？
            <Link to="/login">立即登录</Link>
          </p>
        </form>
      </div>

      <style>{registerStyles}</style>
    </div>
  );
};

const registerStyles = `
  .auth-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 120px);
    padding: 20px;
  }

  .auth-card {
    background: #fff;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
  }

  .auth-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .auth-logo {
    font-size: 3rem;
    margin-bottom: 12px;
  }

  .auth-header h1 {
    font-size: 1.5rem;
    color: #2D6B3B;
    margin-bottom: 8px;
  }

  .auth-header p {
    color: #666;
    font-size: 0.9rem;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-group {
    margin-bottom: 0;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    color: #333;
  }

  .form-group input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .form-group input:focus {
    border-color: #2D6B3B;
    box-shadow: 0 0 0 3px rgba(45, 107, 59, 0.1);
  }

  .error-message {
    background: #fef0f0;
    color: #e74c3c;
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 0.85rem;
  }

  .auth-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #2D6B3B 0%, #1e4a29 100%);
    color: #fff;
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    margin-top: 8px;
  }

  .auth-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(45, 107, 59, 0.4);
  }

  .auth-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .auth-footer {
    text-align: center;
    font-size: 0.9rem;
    color: #666;
    margin-top: 8px;
  }

  .auth-footer a {
    color: #2D6B3B;
    text-decoration: none;
    font-weight: 500;
    margin-left: 4px;
  }

  .auth-footer a:hover {
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    .auth-card {
      padding: 24px;
    }

    .auth-header h1 {
      font-size: 1.25rem;
    }
  }
`;

export default Register;
