import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import { projectApi, logApi } from '../api';
import type { Project, DevLog } from '../types';

interface ProjectForm {
  name: string;
  description: string;
  techStack: string;
  githubUrl: string;
  status: '构思中' | '开发中' | '已发布' | '已归档';
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<DevLog[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<ProjectForm>({
    name: '',
    description: '',
    techStack: '',
    githubUrl: '',
    status: '构思中',
  });
  const [totalProjects, setTotalProjects] = useState(0);

  const animateNumber = (target: number, setter: (n: number) => void, duration = 800) => {
    const startTime = Date.now();
    const startVal = 0;
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(startVal + (target - startVal) * (1 - Math.pow(1 - progress, 3)));
      setter(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    step();
  };

  const loadData = async () => {
    try {
      const [projectsData, logsData] = await Promise.all([
        projectApi.getAll(),
        logApi.getAll(),
      ]);
      setProjects(projectsData);
      setLogs(logsData);
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const monthLogsCount = logsData.filter((l: DevLog) => {
        const d = new Date(l.date);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const now = new Date().toISOString();
      const newProject: Partial<Project> = {
        name: form.name,
        description: form.description,
        techStack: form.techStack.split(",").map(s => s.trim()).filter(Boolean),
        githubUrl: form.githubUrl,
        status: form.status,
        createdAt: now,
        updatedAt: now,
      };
      await projectApi.create(newProject);
  return (
    <div>
      <h1 className="page-title">项目看板</h1>
      <div className="stats-grid">
        <div className="stat-card stat-card-total">
          <div className="stat-label">总项目数</div>
          <div className="stat-value">{totalProjects}</div>
        </div>
        <div className="stat-card stat-card-progress">
          <div className="stat-label">进行中项目</div>
          <div className="stat-value">{progressProjects}</div>
        </div>
        <div className="stat-card stat-card-logs">
      {projects.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📁</div>
          <div className="empty-state-text">还没有项目，点击"创建项目"开始吧</div>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => (<ProjectCard key={p.id} project={p} />))}
        </div>
      )}
      <div className="log-list">
        <div className="log-list-header">
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">创建新项目</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">项目名称 *</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="输入项目名称" required />
                </div>
                <div className="form-group">
                  <label className="form-label">项目描述</label>
                  <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="输入项目描述" />
                </div>
                <div className="form-group">
                  <label className="form-label">技术栈（逗号分隔）</label>
                  <input className="form-input" value={form.techStack} onChange={(e) => setForm({...form, techStack: e.target.value})} placeholder="例如: React, TypeScript, Node.js" />
                </div>
                <div className="form-group">
                  <label className="form-label">GitHub 链接</label>
                  <input className="form-input" value={form.githubUrl} onChange={(e) => setForm({...form, githubUrl: e.target.value})} placeholder="https://github.com/..." />
                </div>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>取消</button>
                <button type="submit" className="btn-primary">创建</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
