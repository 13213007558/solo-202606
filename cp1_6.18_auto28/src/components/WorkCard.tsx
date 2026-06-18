import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Work } from '../types';
import { useAuth } from '../context/AuthContext';

interface WorkCardProps {
  work: Work;
  index?: number;
}

export default function WorkCard({ work, index = 0 }: WorkCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [likes, setLikes] = useState(work.likes);
  const [liked, setLiked] = useState(false);
  const likeBtnRef = useRef<HTMLButtonElement>(null);
  const [particles, setParticles] = useState<{ id: number; tx: number; ty: number }[]>([]);

  const handleClick = () => {
    navigate(`/work/${work.id}`);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`/api/works/${work.id}/like`, { userId: user.id });
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
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      newParticles.push({
        id: Date.now() + i,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 600);
  };

  const getTagEmoji = (tag: string) => {
    const emojiMap: Record<string, string> = {
      流行: '🎤',
      摇滚: '🎸',
      电子: '🎹',
      民谣: '🎻',
      古典: '🎼',
      爵士: '🎷',
      嘻哈: '🎧',
      RnB: '💜',
    };
    return emojiMap[tag] || '🎵';
  };

  return (
    <div
      className="card work-card fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={handleClick}
    >
      <div className="work-card-image">
        {work.tags.length > 0 ? getTagEmoji(work.tags[0]) : '🎵'}
      </div>
      <div className="work-card-body">
        <h3 className="work-card-title">{work.title}</h3>
        <p className="work-card-meta">
          {work.lyricist && <span>作词: {work.lyricist} </span>}
          {work.composer && <span>作曲: {work.composer}</span>}
        </p>
        <div className="work-card-tags">
          {work.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        {work.status === 'draft' && (
          <span className="tag" style={{ background: '#fef3c7', color: '#d97706' }}>
            草稿
          </span>
        )}
        <div className="work-card-footer">
          <button
            ref={likeBtnRef}
            className={`like-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <svg
              viewBox="0 0 24 24"
              fill={liked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span>{likes}</span>
            {particles.map((p) => (
              <span
                key={p.id}
                className="particle"
                style={{
                  '--tx': `${p.tx}px`,
                  '--ty': `${p.ty}px`,
                  left: '50%',
                  top: '50%',
                  width: '8px',
                  height: '8px',
                  background: '#ef4444',
                  borderRadius: '50%',
                } as React.CSSProperties}
              />
            ))}
          </button>
          <span>{new Date(work.createdAt).toLocaleDateString('zh-CN')}</span>
        </div>
      </div>
    </div>
  );
}
