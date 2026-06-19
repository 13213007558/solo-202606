import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';

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
}

const ALL_TECH_TAGS = [
  'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js',
  'Node.js', 'Express', 'Koa', 'Fastify', 'NestJS',
  'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite',
  'Docker', 'Kubernetes', 'AWS', 'Vercel', 'Netlify',
  'TailwindCSS', 'Sass', 'Less', 'Webpack', 'Vite',
  'GraphQL', 'REST API', 'WebSocket', 'Electron', 'React Native',
  'Flutter', 'Swift', 'Kotlin',
];

const STATUS_OPTIONS = ['构思中', '开发中', '已发布', '已归档'];

const TECH_COLORS: Record<string, string> = {
  React: '#61DAFB', Vue: '#42B883', Angular: '#DD0031', Svelte: '#FF3E00',
  'Next.js': '#000000', 'Node.js': '#339933', Express: '#000000',
  TypeScript: '#3178C6', JavaScript: '#F7DF1E', Python: '#3776AB',
  Go: '#00ADD8', Rust: '#000000', MongoDB: '#47A248', PostgreSQL: '#4169E1',
  MySQL: '#4479A1', Redis: '#DC382D', Docker: '#2496ED', TailwindCSS: '#06B6D4',
  GraphQL: '#E10098', Vite: '#646CFF', 'React Native': '#61DAFB',
};

function AnimatedNumber({ target, color }: { target: number; color?: string }) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const duration = 800;
    startTimeRef.current = performance.now();

    function animate(now: number) {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return (
    <span style={{ fontSize: '2rem', fontWeight: 700, color: color || '#1E293B' }}>
      {current}
    </span>
  );
}

function relativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}小时前`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}天前`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}个月前`;
}

export default function HomePage({ showProjects }: { showProjects?: boolean }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    techStack: [] as string[],
    githubUrl: '',
    status: '构思中',
  });
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [projRes, logRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/logs'),
      ]);
      setProjects(projRes.data);
      setLogs(logRes.data);
    } catch (e) {
      console.error('Failed to fetch data', e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeProjects = projects.filter((p) => p.status === '开发中').length;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const logsThisMonth = logs.filter((l) => l.createdAt >= monthStart).length;

  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    await axios.post('/api/projects', newProject);
    setShowCreateModal(false);
    setNewProject({ name: '', description: '', techStack: [], githubUrl: '', status: '构思中' });
    setTagInput('');
    fetchData();
  }

  function handleTagInput(value: string) {
    setTagInput(value);
    if (value.trim()) {
      const filtered = ALL_TECH_TAGS.filter(
        (t) =>
          t.toLowerCase().includes(value.toLowerCase()) &&
          !newProject.techStack.includes(t)
      );
      setTagSuggestions(filtered.slice(0, 6));
    } else {
      setTagSuggestions([]);
    }
  }

  function addTag(tag: string) {
    if (!newProject.techStack.includes(tag)) {
      setNewProject({ ...newProject, techStack: [...newProject.techStack, tag] });
    }
    setTagInput('');
    setTagSuggestions([]);
  }

  function removeTag(tag: string) {
    setNewProject({
      ...newProject,
      techStack: newProject.techStack.filter((t) => t !== tag),
    });
  }

  if (showProjects) {
    return (
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>我的项目</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: '#3B82F6',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#3B82F6')}
          >
            + 新建项目
          </button>
        </div>

        {projects.length === 0 ? (
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '60px 24px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>📦</p>
            <p style={{ color: '#64748B', fontSize: '16px', marginBottom: '16px' }}>
              还没有项目，点击上方按钮创建第一个项目吧
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {showCreateModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowCreateModal(false)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '32px',
                width: '90%',
                maxWidth: '520px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
                新建项目
              </h2>
              <form onSubmit={handleCreateProject}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>
                    项目名称 *
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="输入项目名称"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border 0.2s',
                    }}
                    onFocus={(e) => (e.currentTarget.style.border = '1px solid #3B82F6')}
                    onBlur={(e) => (e.currentTarget.style.border = '1px solid #E2E8F0')}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>
                    项目描述
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="简要描述你的项目"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'border 0.2s',
                    }}
                    onFocus={(e) => (e.currentTarget.style.border = '1px solid #3B82F6')}
                    onBlur={(e) => (e.currentTarget.style.border = '1px solid #E2E8F0')}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>
                    技术栈标签
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    {newProject.techStack.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#fff',
                          background: TECH_COLORS[tag] || '#3B82F6',
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          style={{ color: '#fff', fontSize: '14px', lineHeight: 1 }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => handleTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          e.preventDefault();
                          addTag(tagInput.trim());
                        }
                      }}
                      placeholder="输入技术标签，回车添加"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border 0.2s',
                      }}
                      onFocus={(e) => (e.currentTarget.style.border = '1px solid #3B82F6')}
                      onBlur={(e) => (e.currentTarget.style.border = '1px solid #E2E8F0')}
                    />
                    {tagSuggestions.length > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: '#fff',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          zIndex: 10,
                          overflow: 'hidden',
                        }}
                      >
                        {tagSuggestions.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => addTag(tag)}
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '8px 12px',
                              textAlign: 'left',
                              fontSize: '14px',
                              color: '#475569',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>
                    GitHub 仓库 URL
                  </label>
                  <input
                    type="url"
                    value={newProject.githubUrl}
                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border 0.2s',
                    }}
                    onFocus={(e) => (e.currentTarget.style.border = '1px solid #3B82F6')}
                    onBlur={(e) => (e.currentTarget.style.border = '1px solid #E2E8F0')}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>
                    项目状态
                  </label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      background: '#fff',
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#64748B',
                      border: '1px solid #E2E8F0',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#fff',
                      background: '#3B82F6',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#3B82F6')}
                  >
                    创建
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>看板</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            background: '#F1F5F9',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <AnimatedNumber target={projects.length} />
          <div style={{ fontSize: '14px', color: '#64748B', marginTop: '8px' }}>总项目数</div>
        </div>
        <div
          style={{
            background: '#DBEAFE',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <AnimatedNumber target={activeProjects} color="#1D4ED8" />
          <div style={{ fontSize: '14px', color: '#3B82F6', marginTop: '8px' }}>进行中项目</div>
        </div>
        <div
          style={{
            background: '#DCFCE7',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <AnimatedNumber target={logsThisMonth} color="#16A34A" />
          <div style={{ fontSize: '14px', color: '#22C55E', marginTop: '8px' }}>本月新增日志</div>
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>最近日志</h2>
        {recentLogs.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '14px', padding: '16px 0' }}>
            暂无日志记录，去项目详情页添加你的第一条开发日志吧
          </p>
        ) : (
          <div>
            {recentLogs.map((log, idx) => {
              const proj = projectMap.get(log.projectId);
              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 8px',
                    borderBottom: idx < recentLogs.length - 1 ? '1px solid #F1F5F9' : 'none',
                    transition: 'background 0.15s',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '18px' }}>{log.mood}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {proj && (
                          <Link
                            to={`/projects/${proj.id}`}
                            style={{
                              fontSize: '12px',
                              color: '#3B82F6',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {proj.name}
                          </Link>
                        )}
                        <span
                          style={{
                            fontSize: '14px',
                            color: '#475569',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {log.title}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#94A3B8', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                    {relativeTime(log.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
