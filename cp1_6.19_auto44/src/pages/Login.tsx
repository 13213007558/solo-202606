import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth, useToast } from '../App';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    try {
      const user = await authApi.login(username.trim(), password);
      login(user);
      showToast(`欢迎回来，${user.username}！`);
      const redirect = location.state?.from?.pathname || '/';
      navigate(redirect, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.error || '登录失败，请检查用户名和密码';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>👋 欢迎回来</h1>
        <p className="subtitle">登录味道社区，分享你的独家食谱</p>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>

        <div style={{
          marginTop: 18,
          padding: 12,
          background: 'var(--bg-secondary)',
          borderRadius: 8,
          fontSize: 13,
          color: 'var(--text-secondary)'
        }}>
          💡 测试账号：
          <div style={{ marginTop: 6 }}>
            用户名：<b>厨神小王</b> / 甜品小美 / 面食大师<br />
            密码：<b>123456</b>
          </div>
        </div>

        <div className="auth-footer">
          还没有账号？ <Link to="/register">立即注册</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
