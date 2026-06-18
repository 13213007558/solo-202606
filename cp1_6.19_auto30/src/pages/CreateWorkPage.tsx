import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PerformanceTimeline from '../components/PerformanceTimeline';
import '../styles/createWork.css';

const TAGS = ['流行', '摇滚', '电子', '民谣', '古典', '爵士', '说唱'];

interface Performance {
  id: string;
  date: string;
  venue: string;
  ticketUrl: string;
}

const CreateWorkPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [lyricist, setLyricist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [performances, setPerformances] = useState<Performance[]>([]);
  
  const [perfDate, setPerfDate] = useState('');
  const [perfVenue, setPerfVenue] = useState('');
  const [perfTicketUrl, setPerfTicketUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      loadWork();
    }
  }, [id]);

  const loadWork = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/works/${id}`);
      const work = response.data;
      setTitle(work.title);
      setComposer(work.composer);
      setLyricist(work.lyricist);
      setLyrics(work.lyrics);
      setAudioUrl(work.audioUrl);
      setSelectedTags(work.tags);
      setStatus(work.status);
      setPerformances(work.performances || []);
    } catch (err) {
      setError('加载作品失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddPerformance = async () => {
    if (!perfDate || !perfVenue) {
      setError('请填写演出日期和地点');
      return;
    }

    if (!isEditing) {
      setError('请先保存作品后再添加演出');
      return;
    }

    try {
      const response = await axios.post(`/api/works/${id}/performances`, {
        date: perfDate,
        venue: perfVenue,
        ticketUrl: perfTicketUrl,
      });
      setPerformances([...performances, response.data]);
      setPerfDate('');
      setPerfVenue('');
      setPerfTicketUrl('');
    } catch (err) {
      setError('添加演出失败');
    }
  };

  const handleDeletePerformance = async (perfId: string) => {
    if (!id) return;
    
    try {
      await axios.delete(`/api/works/${id}/performances/${perfId}`);
      setPerformances(performances.filter(p => p.id !== perfId));
    } catch (err) {
      setError('删除演出失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent, submitStatus?: 'draft' | 'published') => {
    e.preventDefault();
    if (!title.trim()) {
      setError('请输入作品标题');
      return;
    }

    const finalStatus = submitStatus || status;

    setSaving(true);
    setError('');

    try {
      const workData = {
        title: title.trim(),
        composer: composer.trim(),
        lyricist: lyricist.trim(),
        lyrics: lyrics.trim(),
        audioUrl: audioUrl.trim(),
        tags: selectedTags,
        status: finalStatus,
      };

      if (isEditing) {
        await axios.put(`/api/works/${id}`, workData);
      } else {
        const response = await axios.post('/api/works', {
          ...workData,
          userId: user?.id,
        });
        if (finalStatus === 'draft') {
          navigate(`/edit/${response.data.id}`);
          return;
        }
      }

      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.error || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = () => {
    setStatus('draft');
    handleSubmit(new Event('submit') as any, 'draft');
  };

  const handlePublish = () => {
    setStatus('published');
    handleSubmit(new Event('submit') as any, 'published');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading" style={{ minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-work-page">
      <div className="container">
        <Link to="/profile" className="back-link">
          ← 返回个人中心
        </Link>

        <h1 className="page-title">
          {isEditing ? '编辑作品' : '创建新作品'}
        </h1>

        {error && <div className="error-banner">{error}</div>}

        <div className="create-work-form card">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h2 className="form-section-title">基本信息</h2>
              
              <div className="form-group">
                <label htmlFor="title">歌曲名称 *</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入歌曲名称"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="composer">作曲</label>
                  <input
                    id="composer"
                    type="text"
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    placeholder="作曲者姓名"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lyricist">作词</label>
                  <input
                    id="lyricist"
                    type="text"
                    value={lyricist}
                    onChange={(e) => setLyricist(e.target.value)}
                    placeholder="作词者姓名"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2 className="form-section-title">风格标签</h2>
              <p className="form-section-desc">选择你的音乐风格（可多选）</p>
              <div className="tags-selector">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-select-btn ${selectedTags.includes(tag) ? 'selected' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h2 className="form-section-title">歌词</h2>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="粘贴或输入歌词内容..."
                rows={8}
              />
            </div>

            <div className="form-section">
              <h2 className="form-section-title">音频文件</h2>
              <p className="form-section-desc">输入音频文件的URL地址</p>
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://example.com/song.mp3"
              />
            </div>

            {isEditing && (
              <div className="form-section">
                <h2 className="form-section-title">演出场次</h2>
                <p className="form-section-desc">添加与该作品相关的演出信息</p>
                
                <div className="add-performance">
                  <div className="perf-inputs">
                    <input
                      type="datetime-local"
                      value={perfDate}
                      onChange={(e) => setPerfDate(e.target.value)}
                      placeholder="演出日期"
                    />
                    <input
                      type="text"
                      value={perfVenue}
                      onChange={(e) => setPerfVenue(e.target.value)}
                      placeholder="演出地点"
                    />
                    <input
                      type="url"
                      value={perfTicketUrl}
                      onChange={(e) => setPerfTicketUrl(e.target.value)}
                      placeholder="票务链接（可选）"
                    />
                  </div>
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleAddPerformance}
                  >
                    添加
                  </button>
                </div>

                {performances.length > 0 && (
                  <div className="performances-preview">
                    <PerformanceTimeline 
                      performances={performances}
                      onDelete={handleDeletePerformance}
                      canEdit={true}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={handleSaveDraft}
                disabled={saving}
              >
                {saving && status === 'draft' ? '保存中...' : '保存草稿'}
              </button>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={handlePublish}
                disabled={saving}
              >
                {saving && status === 'published' ? '发布中...' : (isEditing ? '更新发布' : '立即发布')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkPage;
