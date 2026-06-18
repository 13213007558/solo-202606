import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AVAILABLE_TAGS = ['流行', '摇滚', '电子', '民谣', '古典', '爵士', '嘻哈', 'RnB'];

export default function CreateWork() {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    lyricist: '',
    composer: '',
    lyrics: '',
    audioUrl: '',
    tags: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isEditing && id) {
      fetchWork(id);
    }
  }, [id, isEditing, user, navigate]);

  const fetchWork = async (workId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/works/${workId}`);
      const work = response.data;
      setFormData({
        title: work.title,
        lyricist: work.lyricist,
        composer: work.composer,
        lyrics: work.lyrics,
        audioUrl: work.audioUrl,
        tags: work.tags,
      });
    } catch (error) {
      console.error('加载作品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!user) return;
    if (!formData.title.trim()) {
      alert('请输入作品名称');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && id) {
        await axios.put(`/api/works/${id}`, {
          ...formData,
          status,
        });
      } else {
        await axios.post('/api/works', {
          ...formData,
          userId: user.id,
          status,
        });
      }

      if (status === 'published') {
        navigate('/profile');
      } else {
        alert(status === 'draft' ? '草稿已保存' : '作品已发布');
        navigate('/profile');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container create-work-page">
      <button
        className="btn btn-ghost"
        style={{ marginBottom: '16px' }}
        onClick={() => navigate(-1)}
      >
        ← 返回
      </button>

      <div className="card create-work-form">
        <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>
          {isEditing ? '编辑作品' : '发布新作品'}
        </h2>

        <div className="form-group">
          <label className="form-label">作品名称 *</label>
          <input
            type="text"
            className="form-input"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="输入歌曲名称"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">作词</label>
            <input
              type="text"
              className="form-input"
              value={formData.lyricist}
              onChange={(e) => setFormData({ ...formData, lyricist: e.target.value })}
              placeholder="作词人"
            />
          </div>
          <div className="form-group">
            <label className="form-label">作曲</label>
            <input
              type="text"
              className="form-input"
              value={formData.composer}
              onChange={(e) => setFormData({ ...formData, composer: e.target.value })}
              placeholder="作曲人"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">歌词</label>
          <textarea
            className="form-textarea"
            value={formData.lyrics}
            onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
            placeholder="输入歌词文本..."
            rows={8}
          />
        </div>

        <div className="form-group">
          <label className="form-label">音频文件URL</label>
          <input
            type="url"
            className="form-input"
            value={formData.audioUrl}
            onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
            placeholder="https://example.com/audio.mp3"
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            支持 mp3、wav 等音频格式的在线链接
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">风格标签（可多选）</label>
          <div className="tag-selector">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag-option ${formData.tags.includes(tag) ? 'selected' : ''}`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button
            className="btn btn-outline"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存草稿'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleSubmit('published')}
            disabled={saving}
          >
            {saving ? '发布中...' : isEditing ? '更新发布' : '立即发布'}
          </button>
        </div>
      </div>
    </div>
  );
}
