import { useState } from 'react';

interface SkillNode {
  id: string;
  title: string;
  progress: number;
  parent_id: string | null;
}

interface Props {
  nodes: SkillNode[];
  onSubmit: (nodeIds: string[], durationMinutes: number, notes: string) => void;
}

export default function DailyLogPanel({ nodes, onSubmit }: Props) {
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleNode = (id: string) => {
    setSelectedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNodes.size === 0 || !duration) return;
    const mins = parseInt(duration, 10);
    if (isNaN(mins) || mins <= 0) return;
    onSubmit(Array.from(selectedNodes), mins, notes);
    setSelectedNodes(new Set());
    setDuration('');
    setNotes('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div className="log-section">
      <div className="log-section-header">
        <h3>📋 今日学习日志</h3>
      </div>
      <form className="log-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>学习的技能节点</label>
          {nodes.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, padding: '8px 0' }}>
              暂无技能节点，请先添加
            </div>
          ) : (
            <div className="node-checkbox-list">
              {nodes.map((node) => (
                <label key={node.id} className="node-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedNodes.has(node.id)}
                    onChange={() => toggleNode(node.id)}
                  />
                  <span>{node.title}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-secondary)' }}>
                    {Math.round(node.progress)}%
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>学习时长</label>
          <div className="duration-input">
            <input
              type="number"
              min="1"
              max="720"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="0"
              required
            />
            <span>分钟</span>
          </div>
        </div>

        <div className="form-group">
          <label>学习笔记</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="记录今日学习心得..."
            rows={3}
          />
        </div>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={selectedNodes.size === 0 || !duration}
          style={{ width: '100%', opacity: selectedNodes.size === 0 || !duration ? 0.5 : 1 }}
        >
          {submitted ? '✅ 打卡成功！' : '📝 打卡'}
        </button>
      </form>
    </div>
  );
}
