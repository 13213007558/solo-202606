import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import type { Work } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeSelector from '../components/ThemeSelector';
import Dashboard from '../components/Dashboard';
import WorkCard from '../components/WorkCard';
import type { ThemeName } from '../types';

export default function Profile() {
  const { id } = useParams<{ id?: string }>();
  const { user: currentUser } = useAuth();
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('works');
  const [loading, setLoading] = useState(true);
  const [savingTheme, setSavingTheme] = useState(false);

  const userId = id || currentUser?.id;
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        if (!currentUser) {
          navigate('/login');
        }
        return;
      }

      try {
        const [userRes, worksRes, statsRes] = await Promise.all([
          axios.get(`/api/users/${userId}`),
          axios.get('/api/works', { params: { userId, status: 'published' } }),
          axios.get(`/api/users/${userId}/stats`),
        ]);

        setProfileUser(userRes.data);
        setWorks(worksRes.data.works);
        setStats(statsRes.data);

        if (userRes.data.theme) {
          setTheme(userRes.data.theme as ThemeName);
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, currentUser, navigate, setTheme]);

  const handleThemeChange = async (theme: ThemeName) => {
    if (!isOwnProfile || !currentUser) return;

    setSavingTheme(true);
    try {
      await axios.put(`/api/users/${currentUser.id}/theme`, { theme });
    } catch (error) {
      console.error('保存主题失败:', error);
    } finally {
      setSavingTheme(false);
    }
  };

  const handleDeleteWork = async (workId: string) => {
    if (!confirm('确定要删除这个作品吗？')) return;

    try {
      await axios.delete(`/api/works/${workId}`);
      setWorks((prev) => prev.filter((w) => w.id !== workId));
    } catch (error) {
      console.error('删除作品失败:', error);
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

  if (!profileUser) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-illustration">👤</div>
          <h3 className="empty-state-title">用户不存在</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container profile-page">
      <div className="profile-header">
        <div className="profile-avatar">{profileUser.username.charAt(0)}</div>
        <div className="profile-info">
          <h1>{profileUser.username}</h1>
          <p>独立音乐人 · 加入于 {new Date(profileUser.createdAt).toLocaleDateString('zh-CN')}</p>
          {isOwnProfile && <ThemeSelector onThemeChange={handleThemeChange} />}
          {savingTheme && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>保存中...</span>}
        </div>
        {isOwnProfile && (
          <div style={{ marginLeft: 'auto' }}>
            <Link to="/create" className="btn btn-primary">
              + 发布作品
            </Link>
          </div>
        )}
      </div>

      {isOwnProfile && stats && <Dashboard stats={stats} />}

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'works' ? 'active' : ''}`}
          onClick={() => setActiveTab('works')}
        >
          作品 ({works.length})
        </button>
        {isOwnProfile && (
          <button
            className={`tab-btn ${activeTab === 'drafts' ? 'active' : ''}`}
            onClick={() => setActiveTab('drafts')}
          >
            草稿
          </button>
        )}
      </div>

      {activeTab === 'works' && (
        <div>
          {works.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-illustration">🎵</div>
              <h3 className="empty-state-title">还没有发布的作品</h3>
              <p className="empty-state-desc">
                {isOwnProfile ? '发布你的第一个作品，让更多人听到你的音乐' : '这位音乐人还没有发布作品'}
              </p>
              {isOwnProfile && (
                <Link to="/create" className="btn btn-primary">
                  发布你的第一个作品
                </Link>
              )}
            </div>
          ) : (
            <div className="works-grid">
              {works.map((work, index) => (
                <div key={work.id} style={{ position: 'relative' }}>
                  <WorkCard work={work} index={index} />
                  {isOwnProfile && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-ghost"
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          background: 'rgba(255,255,255,0.9)',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit/${work.id}`);
                        }}
                      >
                        编辑
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          background: 'rgba(255,255,255,0.9)',
                          color: '#ef4444',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWork(work.id);
                        }}
                      >
                        删除
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'drafts' && <DraftsList userId={userId || ''} />}
    </div>
  );
}

function DraftsList({ userId }: { userId: string }) {
  const [drafts, setDrafts] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await axios.get('/api/works', {
          params: { userId, status: 'draft' },
        });
        setDrafts(response.data.works);
      } catch (error) {
        console.error('加载草稿失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [userId]);

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (drafts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-illustration">📝</div>
        <h3 className="empty-state-title">暂无草稿</h3>
        <p className="empty-state-desc">创建一个作品草稿，稍后继续编辑</p>
        <Link to="/create" className="btn btn-primary">
          创建作品
        </Link>
      </div>
    );
  }

  return (
    <div className="works-grid">
      {drafts.map((work, index) => (
        <div key={work.id} onClick={() => navigate(`/edit/${work.id}`)} style={{ cursor: 'pointer' }}>
          <WorkCard work={work} index={index} />
        </div>
      ))}
    </div>
  );
}
