import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../App';

type Mode = 'login' | 'register';

const LoginForm: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const validate = (): string | null => {
    if (!username.trim() || !password.trim()) {
      return '请填写用户名和密码';
    }
    if (mode === 'register' && username.trim().length < 3) {
      return '用户名至少3个字符';
    }
    if (mode === 'register' && password.length < 6) {
      return '密码至少6个字符';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/login' : '/api/register';
      const res = await axios.post(endpoint, { username: username.trim(), password });
      setUser(res.data);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || (mode === 'login' ? '登录失败' : '注册失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 32, background: '#2D3748', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
      <div style={{ display: 'flex', marginBottom: 24, borderRadius: 8, overflow: 'hidden' }}>
        <button onClick={() => { setMode('login'); setError(''); }} style={{ flex: 1, padding: '10px 0', fontSize: 16, fontWeight: 600, background: mode === 'login' ? '#D69E2E' : '#4A5568', color: mode === 'login' ? '#1A202C' : '#CBD5E0', transition: 'all 0.2s' }}>登录</button>
        <button onClick={() => { setMode('register'); setError(''); }} style={{ flex: 1, padding: '10px 0', fontSize: 16, fontWeight: 600, background: mode === 'register' ? '#D69E2E' : '#4A5568', color: mode === 'register' ? '#1A202C' : '#CBD5E0', transition: 'all 0.2s' }}>注册</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#CBD5E0', fontSize: 14 }}>用户名</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="请输入用户名" style={{ width: '100%', padding: '10px 12px', background: '#1A202C', border: '1px solid #4A5568', borderRadius: 6, color: '#F7FAFC', fontSize: 15 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#CBD5E0', fontSize: 14 }}>密码</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码" style={{ width: '100%', padding: '10px 12px', background: '#1A202C', border: '1px solid #4A5568', borderRadius: 6, color: '#F7FAFC', fontSize: 15 }} />
        </div>
        {error && (
          <div style={{ marginBottom: 16, padding: '8px 12px', background: 'rgba(245,101,101,0.15)', border: '1px solid #F56565', borderRadius: 6, color: '#F56565', fontSize: 14 }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 0', fontSize: 16, fontWeight: 700, border: 'none', borderRadius: 8, background: loading ? '#4A5568' : 'linear-gradient(135deg, #B7791F, #D69E2E, #ECC94B)', color: loading ? '#A0AEC0' : '#1A202C', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading && <span style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid #4299E1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
          {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
