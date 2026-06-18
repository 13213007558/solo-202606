import { useState, useEffect, useRef } from 'react';
import './IdeaCard.css';

export interface IdeaCardData {
  id: string;
  type: 'text' | 'image' | 'audio';
  content?: string;
  images?: string[];
  audio?: string;
  audioWaveform?: number[];
  favorite: boolean;
  createdAt: number;
}

interface IdeaCardProps {
  card: IdeaCardData;
  searchKeyword: string;
  onToggleFavorite: (id: string) => void;
  index: number;
  animationKey: number;
}

const formatRelativeTime = (ts: number, now: number) => {
  const diff = Math.max(0, now - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return '刚刚';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}天前`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}个月前`;
  return `${Math.floor(mo / 12)}年前`;
};

const highlightText = (html: string, kw: string) => {
  if (!kw.trim()) return html;
  const stripped = html.replace(/<[^>]*>/g, ' ');
  if (!stripped.toLowerCase().includes(kw.toLowerCase())) return html;
  const regex = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = html.split(/(<[^>]*>)/g);
  return parts
    .map((p) => {
      if (p.startsWith('<') && p.endsWith('>')) return p;
      return p.replace(regex, '<mark class="hl">$1</mark>');
    })
    .join('');
};

const IdeaCard = ({ card, searchKeyword, onToggleFavorite, index, animationKey }: IdeaCardProps) => {
  const [now, setNow] = useState(Date.now());
  const [showParticles, setShowParticles] = useState(false);
  const [imageIdx, setImageIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [liveWave, setLiveWave] = useState<number[]>(card.audioWaveform || new Array(40).fill(0.2));
  const audioElRef = useRef<HTMLAudioElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!card.favorite) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 700);
    }
    onToggleFavorite(card.id);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!card.images) return;
    setImageIdx((imageIdx + 1) % card.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!card.images) return;
    setImageIdx((imageIdx - 1 + card.images.length) % card.images.length);
  };

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = audioElRef.current;
    if (!el) return;
    if (isPlayingAudio) {
      el.pause();
      setIsPlayingAudio(false);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setLiveWave(card.audioWaveform || new Array(40).fill(0.2));
    } else {
      el.currentTime = 0;
      el.play();
      setIsPlayingAudio(true);
      const animate = () => {
        setLiveWave((card.audioWaveform || new Array(40).fill(0.2)).map(() => 0.15 + Math.random() * 0.7));
        animRef.current = requestAnimationFrame(animate);
      };
      animate();
      el.onended = () => {
        setIsPlayingAudio(false);
        if (animRef.current) cancelAnimationFrame(animRef.current);
        setLiveWave(card.audioWaveform || new Array(40).fill(0.2));
      };
    }
  };

  const renderContent = () => {
    if (card.type === 'text') {
      const html = highlightText(card.content || '', searchKeyword);
      return (
        <div
          className="card-text"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    if (card.type === 'image' && card.images && card.images.length > 0) {
      if (card.images.length === 1) {
        return (
          <div className="card-image-single">
            <img src={card.images[0]} alt="" loading="lazy" />
          </div>
        );
      }
      return (
        <div className="card-image-carousel">
          <div className="carousel-viewport">
            <div
              className="carousel-track"
              style={{ transform: `translateX(-${imageIdx * 100}%)` }}
            >
              {card.images.map((url, i) => (
                <div className="carousel-slide" key={i}>
                  <img src={url} alt="" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
          {card.images.length > 1 && (
            <>
              <button className="carousel-arrow left" onClick={prevImage}>‹</button>
              <button className="carousel-arrow right" onClick={nextImage}>›</button>
              <div className="carousel-dots">
                {card.images.map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i === imageIdx ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setImageIdx(i); }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      );
    }
    if (card.type === 'audio') {
      return (
        <div className="card-audio">
          {card.audio && <audio ref={audioElRef} src={card.audio} />}
          <button className={`audio-play-btn ${isPlayingAudio ? 'playing' : ''}`} onClick={toggleAudio}>
            {isPlayingAudio ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <polygon points="8 5 19 12 8 19 8 5" />
              </svg>
            )}
          </button>
          <div className="audio-wave-static">
            {liveWave.slice(0, 50).map((v, i) => (
              <span key={i} className="aw-bar" style={{ height: `${Math.max(6, v * 100)}%` }} />
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="idea-card"
      style={{ animationDelay: `${index * 40}ms` }}
      key={animationKey}
    >
      {renderContent()}
      <div className="card-footer">
        <span className="card-time">{formatRelativeTime(card.createdAt, now)}</span>
        <button
          className={`fav-btn ${card.favorite ? 'active' : ''}`}
          onClick={handleFavorite}
        >
          {showParticles && (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="particle" style={{ '--i': i } as React.CSSProperties} />
              ))}
            </>
          )}
          <svg width="18" height="18" viewBox="0 0 24 24" fill={card.favorite ? '#F5B301' : 'none'} stroke={card.favorite ? '#F5B301' : 'currentColor'} strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default IdeaCard;
