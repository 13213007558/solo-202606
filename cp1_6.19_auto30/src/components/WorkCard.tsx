import { Link } from 'react-router-dom';
import '../styles/workCard.css';

interface WorkCardProps {
  work: {
    id: string;
    title: string;
    composer: string;
    lyricist: string;
    tags: string[];
    likes: number;
    comments: any[];
    status: string;
    createdAt: string;
  };
  delay?: number;
}

const WorkCard = ({ work, delay = 0 }: WorkCardProps) => {
  const style = {
    animationDelay: `${delay}ms`,
  };

  return (
    <Link to={`/work/${work.id}`} className="work-card stagger-item" style={style}>
      <div className="work-card-cover">
        <div className="cover-gradient">
          <span className="music-icon">🎵</span>
        </div>
        {work.status === 'draft' && (
          <span className="draft-badge">草稿</span>
        )}
      </div>
      
      <div className="work-card-content">
        <h3 className="work-title">{work.title}</h3>
        
        <div className="work-meta">
          {work.composer && <span className="meta-item">作曲：{work.composer}</span>}
          {work.lyricist && <span className="meta-item">作词：{work.lyricist}</span>}
        </div>
        
        <div className="work-tags">
          {work.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        
        <div className="work-stats">
          <span className="stat-item">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">{work.likes}</span>
          </span>
          <span className="stat-item">
            <span className="stat-icon">💬</span>
            <span className="stat-value">{work.comments.length}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default WorkCard;
