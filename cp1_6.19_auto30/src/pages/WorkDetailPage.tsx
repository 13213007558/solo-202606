import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CommentList from '../components/CommentList';
import LikeButton from '../components/LikeButton';
import { useAuth } from '../context/AuthContext';
import '../styles/workDetailPage.css';

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  replies: Comment[];
}

interface Performance {
  id: string;
  date: string;
  venue: string;
  ticketUrl: string;
}

interface Work {
  id: string;
  userId: string;
  title: string;
  composer: string;
  lyricist: string;
  lyrics: string;
  audioUrl: string;
  tags: string[];
  status: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  performances: Performance[];
  createdAt: string;
}

const WorkDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchWork = async () => {
    if (!id) return;
    
    try {
      const response = await axios.get(`/api/works/${id}`);
      setWork(response.data);
    } catch (error) {
      console.error('Failed to fetch work:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWork();
  }, [id]);

  const handleLikeChange = () => {
    fetchWork();
  };

  const handleDelete = async () => {
    if (!work || !user) return;
    
    if (window.confirm('确定要删除这个作品吗？')) {
      try {
        await axios.delete(`/api/works/${work.id}`);
        navigate('/profile');
      } catch (error) {
        console.error('Failed to delete work:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading" style={{ minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="container">
        <div className="empty-state" style={{ padding: '100px 0' }}>
          <div className="empty-state-icon">❓</div>
          <h3>作品不存在</h3>
          <p>该作品可能已被删除</p>
          <Link to="/" className="btn btn-primary">返回首页</Link>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === work.userId;
  const isLiked = user ? work.likedBy.includes(user.id) : false;

  return (
    <div className="work-detail-page">
      <div className="container">
        <Link to="/" className="back-link">
          ← 返回列表
        </Link>

        <div className="work-header fade-in">
          <div className="work-cover-large">
            <div className="cover-gradient-large">
              <span className="music-icon-large">🎵</span>
            </div>
            {work.status === 'draft' && (
              <span className="draft-badge-large">草稿</span>
            )}
          </div>
          
          <div className="work-info">
            <h1 className="work-title-large">{work.title}</h1>
            
            <div className="work-meta-large">
              {work.composer && (
                <div className="meta-item-large">
                  <span className="meta-label">作曲</span>
                  <span className="meta-value">{work.composer}</span>
                </div>
              )}
              {work.lyricist && (
                <div className="meta-item-large">
                  <span className="meta-label">作词</span>
                  <span className="meta-value">{work.lyricist}</span>
                </div>
              )}
            </div>

            <div className="work-tags-large">
              {work.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>

            <div className="work-actions">
              <LikeButton 
                workId={work.id} 
                initialLikes={work.likes}
                initialLiked={isLiked}
                onLikeChange={handleLikeChange}
              />
              
              {isOwner && (
                <div className="owner-actions">
                  <Link to={`/edit/${work.id}`} className="btn btn-secondary">
                    编辑
                  </Link>
                  <button className="btn btn-ghost delete-work-btn" onClick={handleDelete}>
                    删除
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {work.audioUrl && (
          <div className="audio-player card">
            <h3>音频播放</h3>
            <audio controls src={work.audioUrl}>
              您的浏览器不支持音频播放
            </audio>
          </div>
        )}

        {work.lyrics && (
          <div className="lyrics-section card">
            <h3 className="section-subtitle">歌词</h3>
            <div className="lyrics-content">
              {work.lyrics.split('\n').map((line, index) => (
                <p key={index} className="lyrics-line">{line}</p>
              ))}
            </div>
          </div>
        )}

        {work.performances && work.performances.length > 0 && (
          <div className="performances-section">
            <h3 className="section-subtitle">相关演出</h3>
            <div className="mini-performances">
              {work.performances.map((perf) => {
                const date = new Date(perf.date);
                const isPast = date < new Date();
                return (
                  <div 
                    key={perf.id} 
                    className={`mini-perf-card card ${isPast ? 'past' : ''}`}
                  >
                    <div className="mini-perf-date">
                      <span className="mini-perf-day">{date.getDate()}</span>
                      <span className="mini-perf-month">{date.toLocaleString('zh-CN', { month: 'short' })}</span>
                    </div>
                    <div className="mini-perf-info">
                      <h4>{perf.venue}</h4>
                      {isPast && <span className="mini-perf-status">已结束</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <CommentList 
          comments={work.comments} 
          workId={work.id}
          onCommentAdded={fetchWork}
        />
      </div>
    </div>
  );
};

export default WorkDetailPage;
