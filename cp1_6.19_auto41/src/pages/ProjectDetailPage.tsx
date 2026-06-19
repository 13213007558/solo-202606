import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Log {
  id: string;
  projectId: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
  updatedAt: string;
}

const MOODS = ['😊', '😐', '😢', '🚀', '💡'];
const MOOD_COLORS: Record<string, string> = {
  '😊': '#22C55E',
  '😐': '#94A3B8',
  '😢': '#6366F1',
  '🚀': '#F97316',
  '💡': '#EAB308',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  '构思中': { bg: '#F1F5F9', text: '#64748B' },
  '开发中': { bg: '#DBEAFE', text: '#3B82F6' },
  '已发布': { bg: '#DCFCE7', text: '#16A34A' },
  '已归档': { bg: '#FEF9C3', text: '#CA8A04' },
};

const TECH_COLORS: Record<string, string> = {
  React: '#61DAFB', Vue: '#42B883', Angular: '#DD0031', Svelte: '#FF3E00',
  'Next.js': '#000000', 'Node.js': '#339933', Express: '#000000',
  TypeScript: '#3178C6', JavaScript: '#F7DF1E', Python: '#3776AB',
  Go: '#00ADD8', Rust: '#000000', MongoDB: '#47A248', PostgreSQL: '#4169E1',
  MySQL: '#4479A1', Redis: '#DC382D', Docker: '#2496ED', TailwindCSS: '#06B6D4',
  GraphQL: '#E10098', Vite: '#646CFF', 'React Native': '#61DAFB',
};

function renderSimpleMarkdown(text: string) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');

  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;

  for (const line of lines) {
    if (line.startsWith('<li>')) {
      if (!inList) {
        result.push('<ul style="margin:4px 0;padding-left:20px;">');
        inList = true;
      }
      result.push(line);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(line);
    }
  }
  if (inList) result.push('</ul>');

  return result.join('<br/>');
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [showNewLog, setShowNewLog] = useState(false);
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    mood: '😐',
  });
  const [editLog, setEditLog] = useState({
    date: '',
    title: '',
    content: '',
    mood: '😐',
  });
  const timelineRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [projRes, logsRes] = await Promise.all([
        axios.get(`/api/projects/${id}`),
        axios.get(`/api/logs/${id}`),
      ]);
      setProject(projRes.data);
      setLogs(logsRes.data);
    } catch (e) {
      console.error('Failed to fetch project', e);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCreateLog(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !newLog.title.trim()) return;
    await axios.post(`/api/logs/${id}`, newLog);
    setShowNewLog(false);
    setNewLog({ date: new Date().toISOString().split('T')[0], title: '', content: '', mood: '😐' });
    fetchData();
  }

  async function handleUpdateLog(logId: string, e: React.FormEvent) {
    e.preventDefault();
    await axios.put(`/api/logs/${logId}`, editLog);
    setEditingLogId(null);
    fetchData();
  }

  async function handleDeleteLog(logId: string) {
    await axios.delete(`/api/logs/${logId}`);
    fetchData();
  }

  function startEditing(log: Log) {
    setEditingLogId(log.id);
    setEditLog({ date: log.date, title: log.title, content: log.content, mood: log.mood });
  }

  async function handleDeleteProject() {
    if (!id) return;
    if (!window.confirm('确定要删除此项目及其所有日志吗？')) return;
    await axios.delete(`/api/projects/${id}`);
    navigate('/');
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>
        加载中...
      </div>
    );
  }

  const statusStyle = STATUS_COLORS[project.status] || STATUS_COLORS['构思中'];

  return (
    <div className="fade-in" style={{ maxWidth: '900px' }}>
      <Link
        to="/projects"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          color: '#3B82F6',
          marginBottom: '20px',
          fontWeight: 500,
        }}
      >
        ← 返回项目列表
      </Link>

      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
              {project.name}
            </h1>
            <p style={{ color: '#64748B', fontSize: '15px', marginBottom: '12px', lineHeight: 1.6 }}>
              {project.description}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {project.techStack.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#fff',
                    background: TECH_COLORS[tag] || '#3B82F6',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: statusStyle.bg,
                  color: statusStyle.text,
                }}
              >
                {project.status}
              </span>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    color: '#64748B',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#3B82F6')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                  GitHub
                </a>
              )}
            </div>
          </div>
          <button
            onClick={handleDeleteProject}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#EF4444',
              border: '1px solid #FECACA',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FEF2F2';
              e.currentTarget.style.borderColor = '#EF4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#FECACA';
            }}
          >
            删除项目
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>开发日志</h2>
        <button
          onClick={() => setShowNewLog(true)}
          style={{
            background: '#3B82F6',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#3B82F6')}
        >
          + 新增日志
        </button>
      </div>

      {showNewLog && (
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            marginBottom: '24px',
          }}
        >
          <form onSubmit={handleCreateLog}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>
                  日期
                </label>
                <input
                  type="date"
                  value={newLog.date}
                  onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>
                  心情
                </label>
                <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setNewLog({ ...newLog, mood: m })}
                      style={{
                        fontSize: '24px',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: newLog.mood === m ? '2px solid #3B82F6' : '2px solid transparent',
                        background: newLog.mood === m ? '#EFF6FF' : 'transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>
                标题 *
              </label>
              <input
                type="text"
                value={newLog.title}
                onChange={(e) => setNewLog({ ...newLog, title: e.target.value })}
                placeholder="日志标题"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>
                正文（支持 **加粗** 和 - 列表）
              </label>
              <textarea
                value={newLog.content}
                onChange={(e) => setNewLog({ ...newLog, content: e.target.value })}
                placeholder="记录你的开发心得..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  lineHeight: 1.6,
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowNewLog(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#64748B',
                  border: '1px solid #E2E8F0',
                }}
              >
                取消
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#fff',
                  background: '#3B82F6',
                }}
              >
                保存
              </button>
            </div>
          </form>
        </div>
      )}

      <div ref={timelineRef} style={{ position: 'relative' }}>
        {logs.length === 0 && !showNewLog && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#64748B',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>📝</p>
            <p>还没有开发日志，点击上方按钮记录你的开发历程</p>
          </div>
        )}

        {logs.map((log, idx) => (
          <div
            key={log.id}
            className="log-card-animate"
            style={{
              animationDelay: `${idx * 0.08}s`,
              position: 'relative',
              paddingLeft: '32px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '8px',
                top: '24px',
                bottom: '-16px',
                width: '2px',
                background: '#E2E8F0',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '3px',
                top: '8px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: MOOD_COLORS[log.mood] || '#94A3B8',
                border: '2px solid #fff',
                boxShadow: '0 0 0 2px ' + (MOOD_COLORS[log.mood] || '#94A3B8'),
              }}
            />

            <div
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {editingLogId === log.id ? (
                <form onSubmit={(e) => handleUpdateLog(log.id, e)}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <input
                        type="date"
                        value={editLog.date}
                        onChange={(e) => setEditLog({ ...editLog, date: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {MOODS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setEditLog({ ...editLog, mood: m })}
                          style={{
                            fontSize: '20px',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            border: editLog.mood === m ? '2px solid #3B82F6' : '2px solid transparent',
                            background: editLog.mood === m ? '#EFF6FF' : 'transparent',
                          }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={editLog.title}
                    onChange={(e) => setEditLog({ ...editLog, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      marginBottom: '8px',
                      outline: 'none',
                    }}
                  />
                  <textarea
                    value={editLog.content}
                    onChange={(e) => setEditLog({ ...editLog, content: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '13px',
                      outline: 'none',
                      resize: 'vertical',
                      lineHeight: 1.6,
                      marginBottom: '8px',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setEditingLogId(null)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#64748B',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#fff',
                        background: '#3B82F6',
                      }}
                    >
                      保存
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '13px', color: '#94A3B8', marginRight: '8px' }}>
                        {log.date}
                      </span>
                      <span style={{ fontSize: '16px' }}>{log.mood}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => startEditing(log)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#64748B',
                          border: '1px solid #E2E8F0',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#3B82F6';
                          e.currentTarget.style.color = '#3B82F6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.color = '#64748B';
                        }}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#64748B',
                          border: '1px solid #E2E8F0',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#EF4444';
                          e.currentTarget.style.color = '#EF4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.color = '#64748B';
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#1E293B' }}>
                    {log.title}
                  </h3>
                  {log.content && (
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#475569',
                        lineHeight: 1.7,
                      }}
                      dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(log.content) }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
