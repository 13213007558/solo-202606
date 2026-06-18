import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import Dashboard from '../components/Dashboard';
import WorkCard from '../components/WorkCard';
import { useAuth } from '../context/AuthContext';
import '../styles/profilePage.css';

interface Work {
  id: string;
  title: string;
  composer: string;
  lyricist: string;
  tags: string[];
  likes: number;
  comments: any[];
  status: string;
  createdAt: string;
}

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [works, setWorks] = useState<Work[]>([]);
  const [activeTab, setActiveTab] = useState<'published' | 'draft'>('published');
  const [loading, setLoading] = useState(true);

  const loadWorks = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get('/api/works', {
        params: {
          userId: user.id,
          sortBy: 'time',
          limit: 100,
        },
      });
      setWorks(response.data.works);
    } catch (error) {
      console.error('Failed to load works:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`/api/users/${user.id}`);
      updateUser(response.data);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  useEffect(() => {
    loadWorks();
    loadUserStats();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const publishedWorks = works.filter(w => w.status === 'published');
  const draftWorks = works.filter(w => w.status === 'draft');
  const displayWorks = activeTab === 'published' ? publishedWorks : draftWorks;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header fade-in">
          <div className="profile-avatar">
            <div className="avatar avatar-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user.username}</h1>
            <p className="profile-bio">独立音乐创作者</p>
            <Link to="/create" className="btn btn-primary">
              + 发布新作品
            </Link>
          </div>
        </div>

        <Dashboard stats={user.stats} />

        <div className="works-section">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'published' ? 'active' : ''}`}
              onClick={() => setActiveTab('published')}
            >
              已发布 ({publishedWorks.length})
            </button>
            <button 
              className={`tab ${activeTab === 'draft' ? 'active' : ''}`}
              onClick={() => setActiveTab('draft')}
            >
              草稿 ({draftWorks.length})
            </button>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : displayWorks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                {activeTab === 'published' ? '🎵' : '📝'}
              </div>
              <h3>
                {activeTab === 'published' ? '还没有已发布的作品' : '还没有草稿'}
              </h3>
              <p>
                {activeTab === 'published' 
                  ? '发布你的第一个作品，让更多人听到你的音乐' 
                  : '开始创作，保存你的灵感草稿'}
              </p>
              <Link to="/create" className="btn btn-primary">
                创建作品
              </Link>
            </div>
          ) : (
            <div className="works-grid">
              {displayWorks.map((work, index) => (
                <WorkCard key={work.id} work={work} delay={index * 50} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
