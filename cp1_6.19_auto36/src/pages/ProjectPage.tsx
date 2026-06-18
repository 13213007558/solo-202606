import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../api';
import { Project, ProjectStatus, STATUS_LABELS } from '../types';
import ProjectCard from '../components/ProjectCard';
import { getAllTechTags, getTechColor } from '../utils';

type ProjectFormData = {
  name: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  status: ProjectStatus;
};

const emptyForm: ProjectFormData = {
  name: '',
  description: '',
  techStack: [],
  githubUrl: '',
  status: 'ideation',
};

export default function ProjectPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>(emptyForm);
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const data = await projectApi.getAll();
    setProjects(data);
    setLoading(false);
  };

  const allTags = getAllTechTags();
  const filteredSuggestions = allTags.filter(
    (t) =>
      t.toLowerCase().includes(tagInput.toLowerCase()) &&
      !formData.techStack.includes(t) &&
      tagInput.trim().length > 0
  );

  const addTag = (tag: string) => {
    if (!formData.techStack.includes(tag)) {
      setFormData({ ...formData, techStack: [...formData.techStack, tag] });
    }
    setTagInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, techStack: formData.techStack.filter((t) => t !== tag) });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    } else if (e.key === 'Backspace' && !tagInput && formData.techStack.length > 0) {
      const newStack = [...formData.techStack];
      newStack.pop();
      setFormData({ ...formData, techStack: newStack });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('请填写项目名称');
      return;
    }
    await projectApi.create(formData);
    setShowModal(false);
    setFormData(emptyForm);
    loadProjects();
  };

  const filteredProjects = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  const statusOptions: { value: ProjectStatus | 'all'; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'ideation', label: STATUS_LABELS.ideation },
    { value: 'development', label: STATUS_LABELS.development },
    { value: 'published', label: STATUS_LABELS.published },
    { value: 'archived', label: STATUS_LABELS.archived },
  ];

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⏳</div>
        <div className="empty-state-title">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">项目管理</h1>
          <p className="page-subtitle">管理你的所有开发项目</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + 创建项目
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            className={`btn btn-sm ${filter === opt.value ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <div className="empty-state-title">暂无项目</div>
            <div className="empty-state-desc">点击"创建项目"按钮开始记录你的第一个项目</div>
          </div>
        </div>
      ) : (
        <div className="grid-container">
          {filteredProjects.map((p) => (
            <ProjectCard key={p.id} project={p} onClick={() => navigate(`/projects/${p.id}`)} />
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">创建新项目</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">项目名称 *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="例如：个人博客系统"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">项目描述</label>
                <textarea
                  className="form-textarea"
                  placeholder="简要描述这个项目是做什么的..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group" ref={suggestionsRef}>
                <label className="form-label">技术栈标签</label>
                <div className="tag-input-container">
                  {formData.techStack.length > 0 && (
                    <div className="tag-chips">
                      {formData.techStack.map((tag) => (
                        <span
                          key={tag}
                          className="tag-chip"
                          style={{ backgroundColor: getTechColor(tag) }}
                        >
                          {tag}
                          <button
                            className="tag-chip-remove"
                            onClick={() => removeTag(tag)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    className="form-input"
                    placeholder="输入技术栈名称，回车添加（如 React、Node.js）"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleTagInputKeyDown}
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="tag-suggestions">
                      {filteredSuggestions.map((tag) => (
                        <div
                          key={tag}
                          className="tag-suggestion-item"
                          onClick={() => addTag(tag)}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">GitHub 仓库 URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/yourname/project"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">项目状态</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as ProjectStatus })
                  }
                >
                  <option value="ideation">{STATUS_LABELS.ideation}</option>
                  <option value="development">{STATUS_LABELS.development}</option>
                  <option value="published">{STATUS_LABELS.published}</option>
                  <option value="archived">{STATUS_LABELS.archived}</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                创建项目
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
