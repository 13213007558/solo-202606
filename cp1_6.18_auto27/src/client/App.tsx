import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import { User } from "./types";
import axios from "axios";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data);
        setShowAuth(false);
      } catch {
        setShowAuth(true);
      }
    };
    checkAuth();
  }, []);

  const handleAuth = async () => {
    setError("");
    try {
      const url = isLogin ? "/api/auth/login" : "/api/auth/register";
      const res = await axios.post(url, { username, password });
      setUser(res.data.user);
      setShowAuth(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "操作失败");
    }
  };

  if (showAuth) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#1A1B2F", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h1 style={{ color: "#FFFFFF", fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>技能树</h1>
          <p style={{ color: "#A0A4C4", textAlign: "center", marginBottom: 32 }}>规划你的学习路径</p>
          <div style={{ display: "flex", marginBottom: 24, backgroundColor: "#252A4A", borderRadius: 12, padding: 4 }}>
            <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, backgroundColor: isLogin ? "#7C5CFC" : "transparent", color: isLogin ? "#FFFFFF" : "#A0A4C4", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}>登录</button>
            <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, backgroundColor: !isLogin ? "#7C5CFC" : "transparent", color: !isLogin ? "#FFFFFF" : "#A0A4C4", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}>注册</button>
          </div>
          {error && <div style={{ color: "#FF6B6B", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{error}</div>}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "#A0A4C4", fontSize: 13, marginBottom: 6 }}>用户名</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="请输入用户名" style={{ width: "100%", padding: "12px 16px", backgroundColor: "#252A4A", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 10, color: "#FFFFFF", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", color: "#A0A4C4", fontSize: 13, marginBottom: 6 }}>密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码" style={{ width: "100%", padding: "12px 16px", backgroundColor: "#252A4A", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 10, color: "#FFFFFF", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={handleAuth} style={{ width: "100%", padding: "14px 0", backgroundColor: "#7C5CFC", color: "#FFFFFF", fontSize: 16, fontWeight: 600, borderRadius: 10, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(124,92,252,0.3)" }}>{isLogin ? "登录" : "注册"}</button>
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
