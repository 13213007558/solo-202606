import { useState } from 'react';

export default function SettingsPage() {
  const [user, setUser] = useState({
    username: localStorage.getItem('dpm_username') || '',
    email: localStorage.getItem('dpm_email') || '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('dpm_username', user.username);
    localStorage.setItem('dpm_email', user.email);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">设置</h1>
          <p className="page-subtitle">管理你的账户信息</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '560px' }}>
        <div className="form-group">
          <label className="form-label">用户名</label>
          <input
            type="text"
            className="form-input"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            placeholder="请输入用户名"
          />
        </div>
        <div className="form-group">
          <label className="form-label">邮箱</label>
          <input
            type="email"
            className="form-input"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="请输入邮箱"
          />
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? '✓ 已保存' : '保存设置'}
        </button>
      </div>

      <div className="card" style={{ maxWidth: '560px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>关于</h3>
        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6' }}>
          DevProject Manager 是一款为独立开发者打造的项目管理与开发日志工具。
          <br />
          版本 v1.0.0
        </p>
      </div>
    </div>
  );
}
