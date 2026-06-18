import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi, logApi } from '../api';
import { Project, LogEntry, STATUS_COLORS, STATUS_LABELS, MOOD_OPTIONS, MOOD_COLORS } from '../types';
import { formatDate, getTechColor, renderMarkdown } from '../utils';

type LogFormData = {
  title: string;
  content: string;
  date: string;
  mood: LogEntry['mood'];
};

const emptyForm: LogFormData = {
  title: '',
  content: '',
  date: new Date().toISOString().split('T')[0],
  mood: '😊',
};

export default function ProjectDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LogFormData>(emptyForm);
  const [editForm, setEditForm] = useState<Record<string, LogFormData>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [p, l] = await Promise.all([projectApi.getById(id), logApi.getByProject(id)]);
        if (cancelled) return;
        setProject(p);
        setLogs(l);
      } catch (e) {
        if (!cancelled) navigate('/projects');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const handleAddLog = async () => {
    if (!formData.title.trim()) return;
    const newLog = await logApi.create(id, formData);
    setLogs([newLog, ...logs]);
    setShowAddModal(false);
    setFormData(emptyForm);
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('确定删除这条日志吗？')) return;
    await logApi.remove(logId);
    setLogs(logs.filter((l) => l.id !== logId));
  };

  const startEdit = (log: LogEntry) => {
    setEditingId(log.id);
    setEditForm({
      ...editForm,
      [log.id]: {
        title: log.title,
        content: log.content,
        date: log.date.split('T')[0],
        mood: log.mood,
      },
    });
  };

  const cancelEdit = (logId: string) => {
    setEditingId(null);
    const { [logId]: _, ...rest } = editForm;
    setEditForm(rest);
  };

  const handleSaveEdit = async (logId: string) => {
    const data = editForm[logId];
    if (!data || !data.title.trim()) return;
    const updated = await logApi.update(logId, data);
    setLogs(logs.map((l) => (l.id === logId ? updated : l)));
    setEditingId(null);
    const { [logId]: _, ...rest } = editForm;
    setEditForm(rest);
  };

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⏳</div>
        <div className="empty-state-title">加载中...</div>
      </div>
    );
  }

  if (!project) return null;

  const statusStyle = STATUS_COLORS[project.status];

  return (
    <div>
      <div className="page-header">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')}>
          ← 返回项目列表
        </button>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + 新增日志
        </button>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="project-detail-header">
          <div className="project-detail-title">
            {project.name}
            <span
              className="status-badge"
              style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
            >
              {STATUS_LABELS[project.status]}
            </span>
          </div>
          <p className="project-detail-desc">{project.description}</p>
          <div className="project-detail-meta">
            <div className="tech-tags">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="tech-tag"
                  style={{ backgroundColor: getTechColor(tech) }}
                >
                  {tech}
                </span>
              ))}
            </div>
            {project.githubUrl && (
              <a
                className="github-link"
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '36px', height: '36px' }}
                title="GitHub 仓库"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>开发日志</h2>
        <span style={{ fontSize: '13px', color: '#64748B' }}>共 {logs.length} 条记录</span>
      </div>

      {logs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">暂无日志记录</div>
            <div className="empty-state-desc">点击右上角按钮记录你的第一条开发日志</div>
          </div>
        </div>
      ) : (
        <div className="timeline">
          {logs.map((log, index) => {
            const isEditing = editingId === log.id;
            const edit = editForm[log.id];
            return (
              <div key={log.id} className="timeline-item" style={{ animationDelay: `${index * 80}ms` }}>
                <style>{`.timeline-item:nth-child(${index + 1})::before { background-color: ${MOOD_COLORS[log.mood]}; }`}</style>
                <div className="log-card">
                  {isEditing && edit ? (
                    <div>
                      <div className="form-group">
                        <label className="form-label">标题</label>
                        <input
                          type="text"
                          className="form-input"
                          value={edit.title}
                          onChange={(e) => setEditForm({ ...editForm, [log.id]: { ...edit, title: e.target.value } })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">日期</label>
                        <input
                          type="date"
                          className="form-input"
                          value={edit.date}
                          onChange={(e) => setEditForm({ ...editForm, [log.id]: { ...edit, date: e.target.value } })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">心情</label>
                        <div className="mood-picker">
                          {MOOD_OPTIONS.map((m) => (
                            <button
                              key={m}
                              className={`mood-option ${edit.mood === m ? 'selected' : ''}`}
                              onClick={() => setEditForm({ ...editForm, [log.id]: { ...edit, mood: m } })}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">内容（支持 Markdown：**加粗**、- 列表）</label>
                        <textarea
                          className="form-textarea"
                          value={edit.content}
                          onChange={(e) => setEditForm({ ...editForm, [log.id]: { ...edit, content: e.target.value } })}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => cancelEdit(log.id)}>
                          取消
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => handleSaveEdit(log.id)}>
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="log-card-header">
                        <div>
                          <div className="log-date">{formatDate(log.date)}</div>
                          <h3 className="log-title">{log.title}</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className="log-mood">{log.mood}</span>
                          <div className="log-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(log)}>
                              编辑
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLog(log.id)}>
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                      <div
                        className="log-content"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(log.content) }}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">新增开发日志</div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">标题</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="记录今天做了什么..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">日期</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">心情</label>
                <div className="mood-picker">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m}
                      className={`mood-option ${formData.mood === m ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, mood: m })}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">内容（支持 Markdown：**加粗**、- 列表）</label>
                <textarea
                  className="form-textarea"
                  placeholder="- 完成了XX功能\n- 修复了XX bug\n**明天计划：** XXX"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleAddLog}>
                保存日志
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
