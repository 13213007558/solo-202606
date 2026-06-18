import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import SkillTreeCanvas from '../components/SkillTreeCanvas';
import DailyLogPanel from '../components/DailyLogPanel';

interface Goal {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

interface SkillNode {
  id: string;
  goal_id: string;
  title: string;
  x: number;
  y: number;
  progress: number;
  parent_id: string | null;
  created_at: string;
}

interface Stats {
  streak: number;
  totalMinutes: number;
  completedNodes: number;
  totalNodes: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || '';
  const username = localStorage.getItem('username') || '';

  const [socket, setSocket] = useState<Socket | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [stats, setStats] = useState<Stats>({ streak: 0, totalMinutes: 0, completedNodes: 0, totalNodes: 0 });
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const fetchGoals = useCallback(async () => {
    try {
      const res = await axios.get('/api/goals', { params: { userId } });
      setGoals(res.data.goals);
      if (res.data.goals.length > 0 && !activeGoal) {
        setActiveGoal(res.data.goals[0]);
      }
    } catch {}
  }, [userId]);

  const fetchNodes = useCallback(async () => {
    if (!activeGoal) return;
    try {
      const res = await axios.get('/api/tree', { params: { goalId: activeGoal.id } });
      setNodes(res.data.nodes);
    } catch {}
  }, [activeGoal]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get('/api/stats', { params: { userId } });
      setStats(res.data);
    } catch {}
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      navigate('/auth');
      return;
    }
    const s = io();
    setSocket(s);
    return () => { s.disconnect(); };
  }, [userId, navigate]);

  useEffect(() => {
    fetchGoals();
    fetchStats();
  }, [fetchGoals, fetchStats]);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  useEffect(() => {
    if (!socket) return;
    socket.on('node:moved', (data: { nodeId: string; x: number; y: number }) => {
      setNodes((prev) => prev.map((n) => (n.id === data.nodeId ? { ...n, x: data.x, y: data.y } : n)));
    });
    return () => { socket.off('node:moved'); };
  }, [socket]);

  const handleCreateGoal = async () => {
    if (!newGoalTitle.trim()) return;
    try {
      const res = await axios.post('/api/goals', { userId, title: newGoalTitle.trim() });
      setGoals((prev) => [res.data, ...prev]);
      setActiveGoal(res.data);
      setNewGoalTitle('');
    } catch {}
  };

  const handleAddNode = async (title: string, parentId: string | null) => {
    if (!activeGoal || !title.trim()) return;
    try {
      const offsetX = 160 * (nodes.length % 4) + 100;
      const offsetY = 140 * Math.floor(nodes.length / 4) + 80;
      const res = await axios.post('/api/tree', {
        goalId: activeGoal.id,
        title: title.trim(),
        parentId,
        x: offsetX,
        y: offsetY,
      });
      setNodes((prev) => [...prev, res.data]);
    } catch {}
  };

  const handleNodeMove = useCallback(
    (nodeId: string, x: number, y: number) => {
      setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, x, y } : n)));
      socket?.emit('node:move', { nodeId, x, y });
      axios.put(`/api/tree/${nodeId}`, { x, y }).catch(() => {});
    },
    [socket]
  );

  const handleLogSubmit = async (nodeIds: string[], durationMinutes: number, notes: string) => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const res = await axios.post('/api/logs', {
        userId,
        date: today,
        nodeIds,
        durationMinutes,
        notes,
      }, {
        params: { goalId: activeGoal?.id },
      });
      if (res.data.nodes) {
        setNodes(res.data.nodes);
      }
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/auth');
  };

  const streakGlow = stats.streak > 7;
  const hours = Math.floor(stats.totalMinutes / 60);
  const minutes = stats.totalMinutes % 60;
  const completionPct = stats.totalNodes > 0 ? Math.round((stats.completedNodes / stats.totalNodes) * 100) : 0;

  const ringRadius = 24;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - completionPct / 100);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>学习路径规划器</h1>
        <div className="header-user">
          <span>{username}</span>
          <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={handleLogout}>
            退出
          </button>
        </div>
      </header>

      <div className={`stats-panel ${streakGlow ? 'streak-glow' : ''}`}>
        <div className="card stat-card">
          <span className={`stat-icon ${stats.streak > 0 ? 'fire-breath' : ''}`}>🔥</span>
          <div className="stat-content">
            <span className="stat-value">{stats.streak}</span>
            <span className="stat-label">连续打卡天数</span>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">⏱️</span>
          <div className="stat-content">
            <span className="stat-value">{hours}小时{minutes}分钟</span>
            <span className="stat-label">总专注时长</span>
          </div>
        </div>
        <div className="card stat-ring-container">
          <svg className="stat-ring-svg" width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r={ringRadius} fill="none" stroke="rgba(124,92,252,0.15)" strokeWidth="5" />
            <circle
              cx="30"
              cy="30"
              r={ringRadius}
              fill="none"
              stroke="#7C5CFC"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              transform="rotate(-90 30 30)"
              style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
            />
            <text x="30" y="33" textAnchor="middle" fill="#E8E8F0" fontSize="13" fontWeight="700">
              {completionPct}%
            </text>
          </svg>
          <div className="stat-content">
            <span className="stat-value">{stats.completedNodes}/{stats.totalNodes}</span>
            <span className="stat-label">已完成节点</span>
          </div>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="tree-section">
          <div className="tree-toolbar">
            <select
              className="goal-select"
              value={activeGoal?.id || ''}
              onChange={(e) => {
                const g = goals.find((g) => g.id === e.target.value);
                setActiveGoal(g || null);
              }}
            >
              <option value="">选择学习目标</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>

            {goals.length === 0 && (
              <div className="goal-create-form">
                <input
                  placeholder="输入学习目标，如：三个月掌握React"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateGoal()}
                  style={{
                    padding: '6px 10px',
                    background: 'var(--bg-primary)',
                    border: '1px solid rgba(124,92,252,0.2)',
                    borderRadius: 6,
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: 13,
                    outline: 'none',
                    flex: 1,
                  }}
                />
                <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={handleCreateGoal}>
                  创建目标
                </button>
              </div>
            )}
          </div>

          {activeGoal && (
            <SkillTreeCanvas
              nodes={nodes}
              onNodeMove={handleNodeMove}
              onAddNode={handleAddNode}
            />
          )}
        </div>

        {activeGoal && (
          <DailyLogPanel
            nodes={nodes}
            onSubmit={handleLogSubmit}
          />
        )}
      </div>
    </div>
  );
}
