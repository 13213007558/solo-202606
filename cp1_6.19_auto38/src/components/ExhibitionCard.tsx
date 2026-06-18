import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Exhibition } from '../types';

interface ExhibitionCardProps {
  exhibition: Exhibition;
}

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  
  const startStr = `${startDate.getFullYear()}年${startDate.getMonth() + 1}月${startDate.getDate()}日`;
  
  if (sameYear) {
    const endStr = `${endDate.getMonth() + 1}月${endDate.getDate()}日`;
    return `${startStr} - ${endStr}`;
  } else {
    const endStr = `${endDate.getFullYear()}年${endDate.getMonth() + 1}月${endDate.getDate()}日`;
    return `${startStr} - ${endStr}`;
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'upcoming':
      return { label: '即将开始', color: '#4299E1', bg: 'rgba(66, 153, 225, 0.15)' };
    case 'ongoing':
      return { label: '进行中', color: '#48BB78', bg: 'rgba(72, 187, 120, 0.15)' };
    case 'ended':
      return { label: '已结束', color: '#A0AEC0', bg: 'rgba(160, 174, 192, 0.15)' };
    default:
      return { label: status, color: '#A0AEC0', bg: 'rgba(160, 174, 192, 0.15)' };
  }
}

function CircularProgress({ value, max }: { value: number; max: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? (value / max) * 100 : 0;
  const offset = circumference - (progress / 100) * circumference;
  
  useEffect(() => {
    const timer = setTimeout(() => setDisplayValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const getColor = () => {
    const ratio = value / max;
    if (ratio > 0.5) return '#48BB78';
    if (ratio > 0.2) return '#ECC94B';
    return '#F56565';
  };

  return (
    <div style={{
      position: 'relative',
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#4A5568"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'var(--text-primary)',
        }}>
          {displayValue}
        </span>
        <span style={{
          fontSize: '10px',
          color: 'var(--text-secondary)',
        }}>
          余票
        </span>
      </div>
    </div>
  );
}

export default function ExhibitionCard({ exhibition }: ExhibitionCardProps) {
  const statusConfig = getStatusConfig(exhibition.status);

  return (
    <Link
      to={`/exhibition/${exhibition.id}`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        display: 'block',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%',
        overflow: 'hidden',
      }}>
        <img
          src={exhibition.coverImage}
          alt={exhibition.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: statusConfig.bg,
          color: statusConfig.color,
          backdropFilter: 'blur(8px)',
        }}>
          {statusConfig.label}
        </div>
      </div>
      
      <div style={{ padding: '16px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '8px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {exhibition.name}
        </h3>
        
        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '12px',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '39px',
        }}>
          {exhibition.description}
        </p>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px',
        }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--accent-amber)',
            fontWeight: '500',
          }}>
            {formatDateRange(exhibition.startDate, exhibition.endDate)}
          </div>
          <CircularProgress 
            value={exhibition.remainingTickets || 0} 
            max={exhibition.capacity} 
          />
        </div>
      </div>
    </Link>
  );
}
