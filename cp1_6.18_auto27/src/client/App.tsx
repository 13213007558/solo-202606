import React, { useState, useEffect } from react;
import { Routes, Route, Navigate } from react-router-dom;
import Dashboard from ./pages/Dashboard;
import { User } from ./types;
import axios from axios;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(/api/stats);
        if (response.status === 200) {
          setShowAuth(false);
        }
      } catch {
        setShowAuth(true);
      }
    };
    checkAuth();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError();
    setLoading(true);
    
    try {
      const endpoint = isLogin ? /api/login : /api/register;
      const response = await axios.post(endpoint, { username, password });
      setUser(response.data.user);
      setShowAuth(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 操作失败);
    } finally {
      setLoading(false);
    }
  };

  if (showAuth) {
    return (
      <div style={{
        minHeight: 100vh,
        display: flex,
        alignItems: center,
        justifyContent: center,
        backgroundColor: #1A1B2F,
        padding: 20px
      }}>
        <div className="card" style={{
          padding: 40px,
          width: 100%,
          maxWidth: 400px
        }}>
          <h1 style={{
            fontSize: 28px,
            fontWeight: 700,
            marginBottom: 8px,
            textAlign: center,
            background: linear-gradient(135deg, #7C5CFC, #9B82FF),
            WebkitBackgroundClip: text,
            WebkitTextFillColor: transparent
          }}>
            学习路径规划器
          </h1>
          <p style={{
            color: #A0A4C4,
            textAlign: center,
            marginBottom: 32px,
            fontSize: 14px
          }}>
            {isLogin ? 欢迎回来，继续你的学习之旅 : 创建账号，开始规划你的学习路径}
          </p>
          
          <form onSubmit={handleAuth} style={{ display: flex, flexDirection: column, gap: 16px }}>
            <div>
              <label style={{
                display: block,
                fontSize: 14px,
                fontWeight: 500,
                marginBottom: 8px,
                color: #A0A4C4
              }}>
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: 100%,
                  padding: 12px 16px,
                  backgroundColor: #1A1B2F,
                  border: 0.5px solid rgba(124, 92, 252, 0.3),
                  borderRadius: 8px,
                  color: #FFFFFF,
                  fontSize: 14px
                }}
                placeholder="请输入用户名"
                required
              />
            </div>
            
            <div>
              <label style={{
                display: block,
                fontSize: 14px,
                fontWeight: 500,
                marginBottom: 8px,
                color: #A0A4C4
              }}>
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: 100%,
                  padding: 12px 16px,
                  backgroundColor: #1A1B2F,
                  border: 0.5px solid rgba(124, 92, 252, 0.3),
                  borderRadius: 8px,
                  color: #FFFFFF,
                  fontSize: 14px
                }}
                placeholder="请输入密码"
                required
              />
            </div>
            
            {error && (
              <p style={{
                color: #FF6B6B,
                fontSize: 13px,
                textAlign: center
              }}>
                {error}
              </p>
            )}
            
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: 12px 24px,
                backgroundColor: #7C5CFC,
                color: #FFFFFF,
                borderRadius: 8px,
                fontSize: 14px,
                fontWeight: 600,
                marginTop: 8px,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 处理中... : (isLogin ? 登录 : 注册)}
            </button>
          </form>
          
          <p style={{
            textAlign: center,
            marginTop: 20px,
            color: #A0A4C4,
            fontSize: 13px
          }}>
            {isLogin ? 还没有账号？ : 已有账号？}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError();
              }}
              style={{
                background: none,
                color: #7C5CFC,
                marginLeft: 4px,
                fontSize: 13px,
                fontWeight: 500
              }}
            >
              {isLogin ? 立即注册 : 立即登录}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard user={user} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
