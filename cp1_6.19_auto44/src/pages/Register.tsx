import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth, useToast } from '../App';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (username.trim().length < 2) {
      setError('用户名至少2个字符');
      return;
    }
    if (!password || password.length < 4) {
      setError('密码至少4位');
      return;
    }
    if (password !== password2) {
      setError('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      const user = await authApi.register(username.trim(), password);
      login(user);
      showToast(`注册成功！欢迎加入，${user.username} 🎉`);
      navigate('/', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.error || '注册失败，请稍后再试';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>🎉 加入味道社区</h1>
        <p className="subtitle">创建账号，开始分享你的第一份食谱</p>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="给自己取一个响亮的名字吧"
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
              placeholder="至少4位字符"
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">确认密码</label>
            <input
              type="password"
              className="form-input"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="再次输入密码"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? '注册中...' : '创建账号'}
          </button>
        </form>

        <div className="auth-footer">
          已有账号？ <Link to="/login">去登录</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
