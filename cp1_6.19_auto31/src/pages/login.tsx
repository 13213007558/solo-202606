import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/events';
import { useAuth } from './main';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(username, password);
      setUser(data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🌿</div>
          <h1>欢迎回来</h1>
          <p>登录绿动社区，参与环保活动</p>
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
              placeholder="请输入密码"
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>

          <div className="auth-divider">
            <span>或</span>
          </div>

          <div className="auth-tips">
            <p>💡 测试账号：环保达人 / 123456</p>
          </div>

          <p className="auth-footer">
            还没有账号？
            <Link to="/register">立即注册</Link>
          </p>
        </form>
      </div>

      <style>{authStyles}</style>
    </div>
  );
};

const authStyles = `
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

  .auth-divider {
    text-align: center;
    position: relative;
    margin: 8px 0;
  }

  .auth-divider::before,
  .auth-divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: calc(50% - 20px);
    height: 1px;
    background: #eee;
  }

  .auth-divider::before {
    left: 0;
  }

  .auth-divider::after {
    right: 0;
  }

  .auth-divider span {
    color: #ccc;
    font-size: 0.8rem;
  }

  .auth-tips {
    background: #e8f5e9;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 0.8rem;
    color: #2D6B3B;
  }

  .auth-tips p {
    margin: 0;
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

export default Login;
