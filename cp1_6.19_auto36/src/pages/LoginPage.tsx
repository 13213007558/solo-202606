import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!form.password.trim()) {
      setError('请输入密码');
      return;
    }
    if (mode === 'register' && !form.email.trim()) {
      setError('请输入邮箱');
      return;
    }

    localStorage.setItem('dpm_logged_in', 'true');
    localStorage.setItem('dpm_username', form.username);
    if (form.email) localStorage.setItem('dpm_email', form.email);
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              background: '#3B82F6',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
          >
            🚀
          </div>
        </div>
        <h1 className="login-title">
          {mode === 'login' ? '欢迎回来' : '创建账户'}
        </h1>
        <p className="login-subtitle">
          {mode === 'login' ? '登录以继续管理你的项目' : '注册一个新账户开始使用'}
        </p>

        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            登录
          </button>
          <button
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            注册
          </button>
        </div>

        {error && (
          <div
            style={{
              background: '#FEE2E2',
              color: '#DC2626',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              className="form-input"
              placeholder="请输入用户名"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">邮箱</label>
              <input
                type="email"
                className="form-input"
                placeholder="请输入邮箱"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              className="form-input"
              placeholder="请输入密码"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '8px' }}>
            {mode === 'login' ? '登录' : '注册'}
          </button>
        </form>
      </div>
    </div>
  );
}
