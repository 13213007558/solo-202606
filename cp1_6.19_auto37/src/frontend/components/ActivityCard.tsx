import { useNavigate } from 'react-router-dom';
import { useCountdown } from '../hooks/useCountdown';
import type { Activity } from '../types';

interface Props {
  activity: Activity;
}

function ActivityCard({ activity }: Props) {
  const navigate = useNavigate();
  const countdown = useCountdown(activity.deadline);
  const progress = activity.achievementRate || 0;
  const raised = activity.totalAmount || 0;

  const gradientStyle = {
    background: `linear-gradient(90deg, 
      hsl(${Math.max(0, 12 - progress * 0.12)}, 85%, 62%) 0%, 
      hsl(${Math.min(145, progress * 1.45)}, 65%, 55%) 100%)`,
    width: `${progress}%`,
  };

  const formatCountdown = () => {
    if (countdown.isExpired) return '已结束';
    const parts: string[] = [];
    if (countdown.days > 0) parts.push(`${countdown.days}天`);
    parts.push(
      `${String(countdown.hours).padStart(2, '0')}:${String(countdown.minutes).padStart(2, '0')}:${String(countdown.seconds).padStart(2, '0')}`
    );
    return parts.join(' ');
  };

  return (
    <div
      className="activity-card"
      onClick={() => navigate(`/activity/${activity.id}`)}
    >
      <div className="activity-card-header">
        <div className="activity-card-title">{activity.name}</div>
        <div className="activity-card-creator">
          <span>👤</span>
          <span>{activity.creatorName}</span>
        </div>
      </div>
      <div className="activity-card-body">
        <div className="activity-card-desc">{activity.description}</div>
        <div className="progress-container">
          <div className="progress-label">
            <span className="progress-amount">¥{raised.toLocaleString()}</span>
            <span className="progress-target">/ ¥{activity.targetAmount.toLocaleString()}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={gradientStyle} />
          </div>
        </div>
        <div className="activity-card-footer">
          <div className={`countdown ${countdown.isUrgent ? 'countdown-urgent' : ''}`}>
            <span>⏱</span>
            <span className="countdown-digits">{formatCountdown()}</span>
          </div>
          <div className="view-activity">
            查看详情 <span>→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityCard;
