import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { User, SkillNode, Stats, Goal } from "../types";
import SkillTreeCanvas from "../components/SkillTreeCanvas";
import DailyLogPanel from "../components/DailyLogPanel";

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [stats, setStats] = useState<Stats>({
    streakDays: 0,
    totalMinutes: 0,
    completedNodes: 0,
    totalNodes: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      const [treeResponse, statsResponse] = await Promise.all([
        axios.get("/api/tree"),
        axios.get("/api/stats"),
      ]);
      setGoal(treeResponse.data.goal);
      setNodes(treeResponse.data.skill_nodes || []);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNodesUpdate = useCallback((updatedNodes: SkillNode[]) => {
    setNodes(updatedNodes);
  }, []);

  const handleProgressUpdate = useCallback(
    async (updates: { id: string; progress: number }[]) => {
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          const update = updates.find((u) => u.id === n.id);
          return update ? { ...n, progress: update.progress } : n;
        })
      );
      try {
        const statsResponse = await axios.get("/api/stats");
        setStats(statsResponse.data);
      } catch (error) {
        console.error("刷新统计数据失败:", error);
      }
    },
    []
  );

  const handleLogSubmit = useCallback(
    async (skillNodeIds: string[], duration: number, notes: string) => {
      try {
        await axios.post("/api/logs", { skillNodeIds, duration, notes });
        await fetchData();
      } catch (error) {
        console.error("提交日志失败:", error);
      }
    },
    [fetchData]
  );

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return hours + "小时" + mins + "分钟";
    } else if (hours > 0) {
      return hours + "小时";
    } else {
      return mins + "分钟";
    }
  };

  const renderProgressRing = (completed: number, total: number) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = total > 0 ? completed / total : 0;
    const dashOffset = circumference * (1 - progress);

    return (
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(26, 27, 47, 0.8)" strokeWidth="8" />
        <circle className="progress-ring-circle" cx="50" cy="50" r={radius} fill="none" stroke="#7C5CFC" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 0.5s ease-out" }} />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="18" fontWeight="700">{total > 0 ? Math.round(progress * 100) : 0}%</text>
      </svg>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#1A1B2F" }}>
        <div style={{ width: 48, height: 48, border: "4px solid rgba(124, 92, 252, 0.2)", borderTopColor: "#7C5CFC", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isHot = stats.streakDays > 7;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1A1B2F", padding: 24 }}>
      <style>{`@media (max-width: 768px) { .dashboard-grid { grid-template-columns: 1fr !important; } }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF", marginBottom: 8 }}>{goal?.title || "技能树"}</h1>
        <p style={{ fontSize: 14, color: "#A0A4C4" }}>欢迎，{user?.username || "用户"}</p>
      </div>

      <div className={"card " + (isHot ? "stats-panel-hot" : "")} style={{ padding: 24, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: "#FFFFFF" }}>🔥 {stats.streakDays}</span>
          <span style={{ fontSize: 13, color: "#A0A4C4" }}>连续打卡天数</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#7C5CFC" }}>⏱️ {formatDuration(stats.totalMinutes)}</span>
          <span style={{ fontSize: 13, color: "#A0A4C4" }}>总专注时长</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {renderProgressRing(stats.completedNodes, stats.totalNodes)}
          <span style={{ fontSize: 13, color: "#A0A4C4" }}>完成 {stats.completedNodes} / {stats.totalNodes} 节点</span>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "70% 30%", gap: 24 }}>
        <div className="skill-tree-container" style={{ height: "calc(100vh - 320px)", minHeight: 400 }}>
          <SkillTreeCanvas nodes={nodes} onNodesUpdate={handleNodesUpdate} onProgressUpdate={handleProgressUpdate} />
        </div>
        <div>
          <DailyLogPanel nodes={nodes} onLogSubmit={handleLogSubmit} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
