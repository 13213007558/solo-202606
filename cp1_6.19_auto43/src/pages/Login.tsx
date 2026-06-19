import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import type { User } from '../types';
import './Auth.css';

interface Props {
  onLogin: (user: User) => void;
}

const Login = ({ onLogin }: Props) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.username.trim()) {
      setError('请输入用户名');
      return;
    }
    
    if (!formData.password) {
      setError('请输入密码');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await axios.post('/api/auth/login', formData);
      const user = res.data;
      
      localStorage.setItem('museum_user', JSON.stringify(user));
      onLogin(user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-logo">🏛️</div>
          <h1 className="auth-title">管理员登录</h1>
          <p className="auth-subtitle">登录后管理您的博物馆展览</p>
        </div>
        
        {error && <div className="form-error-banner">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              className="form-input"
              placeholder="请输入用户名"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              className="form-input"
              placeholder="请输入密码"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
        
        <div className="auth-footer">
          <span className="auth-hint">还没有账号？</span>
          <Link to="/register" className="auth-link">立即注册</Link>
        </div>
        
        <div className="auth-tip">
          <p>💡 演示账号：admin / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
