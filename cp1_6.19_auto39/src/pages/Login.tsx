import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface LoginProps {
  onLogin: (user: { id: string; username: string; avatar: string; bio: string }) => void;
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/users/login', { username, password });
      onLogin(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">登录</h2>
      {error && (
        <div style={{ color: '#e07a5f', marginBottom: '16px', textAlign: 'center' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">用户名</label>
          <input
            type="text"
            className="form-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="请输入用户名"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">密码</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="请输入密码"
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
      <div className="form-footer">
        还没有账号？<Link to="/register">立即注册</Link>
      </div>
      <div style={{ marginTop: '20px', fontSize: '0.85rem', color: '#999', textAlign: 'center' }}>
        测试账号：厨房小白 / 123456
      </div>
    </div>
  );
}

export default Login;
