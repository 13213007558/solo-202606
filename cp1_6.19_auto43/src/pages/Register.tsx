import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
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
    
    if (formData.username.length < 3) {
      setError('用户名至少3个字符');
      return;
    }
    
    if (!formData.password) {
      setError('请输入密码');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('密码至少6个字符');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post('/api/auth/register', {
        username: formData.username,
        password: formData.password
      });
      
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-logo">🏛️</div>
          <h1 className="auth-title">管理员注册</h1>
          <p className="auth-subtitle">创建账号开始管理您的博物馆</p>
        </div>
        
        {error && <div className="form-error-banner">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              className="form-input"
              placeholder="请输入用户名（至少3个字符）"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              className="form-input"
              placeholder="请输入密码（至少6个字符）"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">确认密码</label>
            <input
              type="password"
              className="form-input"
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
        
        <div className="auth-footer">
          <span className="auth-hint">已有账号？</span>
          <Link to="/login" className="auth-link">立即登录</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
