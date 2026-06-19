import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Exhibition } from '../types';
import './ExhibitionCard.css';

interface Props {
  exhibition: Exhibition;
}

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const startStr = `${startDate.getFullYear()}年${startDate.getMonth() + 1}月${startDate.getDate()}日`;
  
  if (startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth()) {
    return `${startStr} - ${endDate.getDate()}日`;
  }
  
  const endStr = `${endDate.getMonth() + 1}月${endDate.getDate()}日`;
  return `${startStr} - ${endStr}`;
};

const getStatusConfig = (status?: string) => {
  switch (status) {
    case 'upcoming':
      return { label: '即将开始', color: 'blue' };
    case 'ongoing':
      return { label: '进行中', color: 'green' };
    case 'ended':
      return { label: '已结束', color: 'gray' };
    default:
      return { label: '未知', color: 'gray' };
  }
};

const ExhibitionCard = ({ exhibition }: Props) => {
  const [animatedCount, setAnimatedCount] = useState(0);
  const statusConfig = getStatusConfig(exhibition.status);
  
  const remaining = exhibition.remainingTickets ?? 0;
  const total = exhibition.totalCapacity ?? 100;
  const percentage = Math.min((remaining / total) * 100, 100);
  
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const end = remaining;
    const duration = 1200;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedCount(Math.floor(start + (end - start) * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [remaining]);

  return (
    <Link to={`/exhibition/${exhibition.id}`} className="exhibition-card">
      <div className="card-image-wrapper">
        <img 
          src={exhibition.coverImage} 
          alt={exhibition.name}
          className="card-image"
        />
        <span className={`status-tag status-${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{exhibition.name}</h3>
        <p className="card-date">{formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
        
        <div className="card-footer">
          <div className="remaining-ring">
            <svg width="64" height="64" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#4A5568"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#D69E2E"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
                className="ring-progress"
                style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
              />
              <text
                x="50"
                y="45"
                textAnchor="middle"
                fill="#E2E8F0"
                fontSize="18"
                fontWeight="700"
              >
                {animatedCount}
              </text>
              <text
                x="50"
                y="62"
                textAnchor="middle"
                fill="#A0AEC0"
                fontSize="10"
              >
                剩余票
              </text>
            </svg>
          </div>
          
          <div className="card-meta">
            <span className="meta-label">展厅容量</span>
            <span className="meta-value">{exhibition.capacity} 人/天</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ExhibitionCard;
