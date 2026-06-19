import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi, logApi } from '../api';
import type { Project, DevLog } from '../types';

interface LogForm {
  date: string;
  title: string;
  content: string;
  mood: string;
}

const MOODS = ['😊', '😐', '😢', '🚀', '💡'];

const renderMarkdown = (text: string): React.ReactNode => {
  const lines = text.split("
");
  const result: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];
  const flushList = (key: number) => {
    if (inList && listItems.length > 0) {
      result.push(<ul key={key}>{listItems}</ul>);
      listItems = [];
      inList = false;
    }
  };

const statusColors: Record<string, string> = {
  "构思中": "#F1F5F9|#64748B",
  "开发中": "#DBEAFE|#3B82F6",
  "已发布": "#D1FAE5|#10B981",
  "已归档": "#FEF3C7|#F59E0B",
};

const techColors: Record<string, string> = {
  React: "#DBEAFE|#3B82F6",
  TypeScript: "#DBEAFE|#3B82F6",
  "Node.js": "#D1FAE5|#10B981",
  Vue: "#D1FAE5|#10B981",

  useEffect(() => { if (id) loadData(); }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      const [proj, projLogs] = await Promise.all([projectApi.getById(id), logApi.getByProject(id)]);
      setProject(proj);
      const sorted = [...projLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setLogs(sorted);
    } catch (e) { console.error("加载失败", e); }
  };
  if (!project) {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon">⏳</div>
        <div className="empty-state-text">加载中...</div>
      </div>
    );
  }

  const sc = (statusColors[project.status] || "#F1F5F9|#64748B").split("|");

  return (
    <div>
        <p className="project-detail-desc">{project.description}</p>
        <div className="project-detail-meta">
          <span className="project-detail-meta-item">📅 创建于 {new Date(project.createdAt).toLocaleDateString("zh-CN")}</span>
          {project.updatedAt && (<span className="project-detail-meta-item">✏️ 更新于 {new Date(project.updatedAt).toLocaleDateString("zh-CN")}</span>)}
          <span className="project-detail-meta-item">📝 共 {logs.length} 条日志</span>
        </div>
      </div>
      <div className="project-info-grid">
      <div className="timeline-section">
        <div className="timeline-header">
          <h2 className="section-title" style={{marginBottom: 0}}>开发日志</h2>
          <button className="btn-primary" onClick={() => {setShowCreateForm(!showCreateForm); setEditingLog(null); setLogForm(emptyForm);}}>
            {showCreateForm ? "取消" : "+ 新增日志"}
          </button>
        </div>
        {(showCreateForm || editingLog) && (
          <div className="card" style={{marginBottom: 24}}>
              <div className="form-group">
                <label className="form-label">内容（支持 **粗体** 和 - 列表）</label>
                <textarea className="form-textarea" value={logForm.content} onChange={(e) => setLogForm({...logForm, content: e.target.value})} placeholder="今天完成了什么..." required style={{minHeight: 140}} />
              </div>
              <div className="form-group">
                <label className="form-label">今日心情</label>
                <div className="mood-selector">
                  {MOODS.map((m) => (
        {logs.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-text">还没有开发日志，点击"新增日志"开始记录</div>
          </div>
        ) : (
          <div className="timeline">
            {logs.map((log, index) => (
              <div key={log.id} className="timeline-item" style={{animationDelay: `${index * 0.05}s`}}>
                <div className={`timeline-dot mood-${log.mood}`}></div>
                <div className="timeline-content">
                  <div className="timeline-top">
                    <div>
                      <div className="timeline-date">📅 {new Date(log.date).toLocaleDateString("zh-CN")}</div>
                      <div className="timeline-title">{log.title}</div>
                    </div>
                    <div style={{display: "flex", alignItems: "center", gap: 12}}>
                      <span className="timeline-mood">{log.mood}</span>
                      <div className="timeline-actions">
                        <button className="btn-secondary" onClick={() => startEdit(log)}>编辑</button>
                        <button className="btn-danger" onClick={() => handleDeleteLog(log.id)}>删除</button>
                      </div>
                    </div>
                  </div>
                  <div className="timeline-body">{renderMarkdown(log.content)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
