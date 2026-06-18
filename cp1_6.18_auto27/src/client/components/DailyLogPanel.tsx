import React, { useState } from 'react';
import { SkillNode } from '../types';

interface DailyLogPanelProps {
  nodes: SkillNode[];
  onLogSubmit: (nodeIds: string[], duration: number, notes: string) => Promise<void>;
}

const DailyLogPanel: React.FC<DailyLogPanelProps> = ({ nodes, onLogSubmit }) => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}小时${mins}分钟`;
    } else if (hours > 0) {
      return `${hours}小时`;
    } else {
      return `${mins}分钟`;
    }
  };

  const toggleNode = (nodeId: string) => {
    setSelectedNodes(prev =>
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleSubmit = async () => {
    const durationNum = parseInt(duration, 10);
    if (selectedNodes.length === 0 || !durationNum || durationNum <= 0) return;

    setIsSubmitting(true);
    try {
      await onLogSubmit(selectedNodes, durationNum, notes);
      setSelectedNodes([]);
      setDuration("");
      setNotes("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("提交日志失败:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const durationNum = parseInt(duration, 10) || 0;

  return (
    <div style={{
      backgroundColor: "#252A4A",
      borderRadius: 16,
      padding: 24,
      border: "0.5px solid rgba(124, 92, 252, 0.3)",
      boxShadow: "0 0 20px rgba(124, 92, 252, 0.1)"
    }}>
      <h2 style={{
        fontSize: 20,
        fontWeight: 700,
        marginBottom: 20,
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        gap: 8
      }}>
        <span>📝</span>
        今日学习打卡
      </h2>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 12, color: "#A0A4C4" }}>
          选择学习的技能节点
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
          {nodes.map(node => {
            const isSelected = selectedNodes.includes(node.id);
            return (              <div
                key={node.id}
                onClick={() => toggleNode(node.id)}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  cursor: "pointer",
                  border: isSelected ? "1.5px solid #7C5CFC" : "0.5px solid rgba(124, 92, 252, 0.2)",
                  backgroundColor: isSelected ? "rgba(124, 92, 252, 0.15)" : "rgba(26, 27, 47, 0.5)",
                  transition: "all 0.2s ease",
                  position: "relative"
                }}
              >
                {isSelected && (
                  <div style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: "50%", backgroundColor: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#FFFFFF", fontWeight: 700 }}>
                    ✓
                  </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF", marginBottom: 10, paddingRight: isSelected ? 28 : 0 }}>
                  {node.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#A0A4C4" }}>进度</span>
                  <span style={{ fontSize: 12, color: "#7C5CFC", fontWeight: 600 }}>{node.progress}%</span>
                </div>
                <div style={{ width: "100%", height: 6, borderRadius: 3, backgroundColor: "rgba(26, 27, 47, 0.8)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${node.progress}%`, backgroundColor: "#7C5CFC", borderRadius: 3, transition: "width 0.3s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, fontWeight: 500, marginBottom: 8, color: "#A0A4C4" }}>
          <span>学习时长（分钟）</span>
          {durationNum > 0 && <span style={{ color: "#7C5CFC", fontWeight: 600, fontSize: 13 }}>{formatDuration(durationNum)}</span>}
        </label>
        <input type="number" min="0" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="请输入学习分钟数" style={{ width: "100%", padding: "12px 16px", backgroundColor: "#1A1B2F", border: "0.5px solid rgba(124, 92, 252, 0.3)", borderRadius: 8, color: "#FFFFFF", fontSize: 14 }} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8, color: "#A0A4C4" }}>
          学习笔记
        </label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="记录今天的学习心得、收获或遇到的问题..." rows={4} style={{ width: "100%", padding: "12px 16px", backgroundColor: "#1A1B2F", border: "0.5px solid rgba(124, 92, 252, 0.3)", borderRadius: 8, color: "#FFFFFF", fontSize: 14, resize: "none", fontFamily: "inherit" }} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || selectedNodes.length === 0 || !durationNum || durationNum <= 0}
        style={{
          width: "100%",
          padding: "14px 24px",
          backgroundColor: "#7C5CFC",
          color: "#FFFFFF",
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 600,
          border: "none",
          opacity: (isSubmitting || selectedNodes.length === 0 || !durationNum || durationNum <= 0) ? 0.6 : 1,
          cursor: (isSubmitting || selectedNodes.length === 0 || !durationNum || durationNum <= 0) ? "not-allowed" : "pointer",
          transition: "opacity 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8
        }}
      >
        {isSubmitting ? (
          <span>提交中...</span>
        ) : (
          <>
            <span>完成打卡</span>
            {selectedNodes.length > 0 && (
              <span style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", padding: "2px 10px", borderRadius: 12, fontSize: 13 }}>
                {selectedNodes.length}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};

export default DailyLogPanel;
