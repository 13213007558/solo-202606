import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface RegisterProps {
  onLogin: (user: { id: string; username: string; avatar: string; bio: string }) => void;
}

function Register({ onLogin }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const response = await axios.post('/api/users/register', { username, password });
      onLogin(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">注册</h2>
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
            placeholder="请输入密码（至少6位）"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">确认密码</label>
          <input
            type="password"
            className="form-input"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="请再次输入密码"
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? '注册中...' : '注册'}
        </button>
      </form>
      <div className="form-footer">
        已有账号？<Link to="/login">立即登录</Link>
      </div>
    </div>
  );
}

export default Register;
