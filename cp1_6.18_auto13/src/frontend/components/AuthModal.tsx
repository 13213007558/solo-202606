import { useState } from 'react';
import axios from 'axios';
import { User } from '../App';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: User) => void;
  switchMode: () => void;
}

function AuthModal({ mode, onClose, onSuccess, switchMode }: AuthModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/login' : '/api/register';
      const response = await axios.post(endpoint, {
        username,
        password,
      });
      onSuccess(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal' onClick={e => e.stopPropagation()}>
        <h2>{mode === 'login' ? '登录' : '注册'}</h2>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label>用户名</label>
            <input
              type='text'
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className='form-group'>
            <label>密码</label>
            <input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          {error && <div className='error-text'>{error}</div>}
          <button type='submit' className='btn btn-primary' style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <div className='modal-footer'>
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button onClick={switchMode} className='switch-btn'>
            {mode === 'login' ? '立即注册' : '立即登录'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;

