import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Work, Comment, Performance } from '../types';
import CommentList from '../components/CommentList';
import { useAuth } from '../context/AuthContext';

export default function WorkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [work, setWork] = useState<Work | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const likeBtnRef = useRef<HTMLButtonElement>(null);
  const [particles, setParticles] = useState<{ id: number; tx: number; ty: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [workRes, commentsRes, performancesRes] = await Promise.all([
          axios.get(`/api/works/${id}`),
          axios.get(`/api/works/${id}/comments`),
          axios.get(`/api/works/${id}/performances`),
        ]);

        setWork(workRes.data);
        setComments(commentsRes.data);
        setPerformances(performancesRes.data);
        setLikes(workRes.data.likes);

        if (user) {
          const likedRes = await axios.get(`/api/works/${id}/liked`, {
            params: { userId: user.id },
          });
          setLiked(likedRes.data.liked);
        }
      } catch (error) {
        console.error('加载作品详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!id) return;

    try {
      const response = await axios.post(`/api/works/${id}/like`, { userId: user.id });
      setLikes(response.data.likes);
      setLiked(response.data.liked);

      if (response.data.liked) {
        createParticles();
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const createParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 40 + Math.random() * 30;
      newParticles.push({
        id: Date.now() + i,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 600);
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

  if (!work) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-illustration">❓</div>
          <h3 className="empty-state-title">作品不存在</h3>
          <p className="empty-state-desc">该作品可能已被删除</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container work-detail-page">
      <div className="work-detail-header">
        <button
          className="btn btn-ghost"
          style={{ marginBottom: '16px' }}
          onClick={() => navigate(-1)}
        >
          ← 返回
        </button>
        <h1 className="work-detail-title">{work.title}</h1>
        <div className="work-detail-meta">
          {work.lyricist && <span>🎤 作词: {work.lyricist}</span>}
          {work.composer && <span>🎹 作曲: {work.composer}</span>}
          <span>📅 {new Date(work.createdAt).toLocaleDateString('zh-CN')}</span>
        </div>
        <div className="work-detail-tags">
          {work.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>

        <button
          ref={likeBtnRef}
          className={`like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          style={{ fontSize: '1rem', padding: '8px 16px' }}
        >
          <svg
            viewBox="0 0 24 24"
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: '24px', height: '24px' }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span>{likes} 赞</span>
          {particles.map((p) => (
            <span
              key={p.id}
              className="particle"
              style={{
                '--tx': `${p.tx}px`,
                '--ty': `${p.ty}px`,
                left: '50%',
                top: '50%',
                width: '10px',
                height: '10px',
                background: '#ef4444',
                borderRadius: '50%',
              } as React.CSSProperties}
            />
          ))}
        </button>
      </div>

      <div className="work-detail-body">
        <div>
          {work.audioUrl && (
            <div className="work-detail-section">
              <h2 className="section-title">播放</h2>
              <div className="audio-player">
                <audio controls src={work.audioUrl}>
                  您的浏览器不支持音频播放
                </audio>
              </div>
            </div>
          )}

          {work.lyrics && (
            <div className="work-detail-section">
              <h2 className="section-title">歌词</h2>
              <div className="lyrics-box">{work.lyrics}</div>
            </div>
          )}

          <CommentList comments={comments} workId={work.id} />
        </div>

        <div>
          {performances.length > 0 && (
            <div className="work-detail-section">
              <h2 className="section-title">相关演出</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {performances.map((perf) => {
                  const date = new Date(perf.date);
                  const isPast = date < new Date();
                  return (
                    <div
                      key={perf.id}
                      className={`card ${isPast ? '' : ''}`}
                      style={{
                        padding: '16px',
                        opacity: isPast ? 0.6 : 1,
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: '6px' }}>{perf.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        📅 {date.toLocaleDateString('zh-CN')}
                      </div>
                      {perf.location && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          📍 {perf.location}
                        </div>
                      )}
                      {isPast && (
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '8px',
                            background: 'var(--text-secondary)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                          }}
                        >
                          已结束
                        </span>
                      )}
                      {perf.ticketUrl && !isPast && (
                        <a
                          href={perf.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{
                            display: 'inline-block',
                            marginTop: '8px',
                            fontSize: '0.8rem',
                            padding: '4px 12px',
                          }}
                        >
                          购票
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
