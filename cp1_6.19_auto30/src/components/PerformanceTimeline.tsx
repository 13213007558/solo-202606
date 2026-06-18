import '../styles/performanceTimeline.css';

interface Performance {
  id: string;
  date: string;
  venue: string;
  ticketUrl: string;
  workId?: string;
  workTitle?: string;
}

interface PerformanceTimelineProps {
  performances: Performance[];
  onDelete?: (id: string) => void;
  canEdit?: boolean;
}

const PerformanceTimeline = ({ performances, onDelete, canEdit = false }: PerformanceTimelineProps) => {
  const getDaysUntil = (dateStr: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const perfDate = new Date(dateStr);
    perfDate.setHours(0, 0, 0, 0);
    const diffTime = perfDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isPast = (dateStr: string) => getDaysUntil(dateStr) < 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatCountdown = (dateStr: string) => {
    const days = getDaysUntil(dateStr);
    if (days < 0) return '已结束';
    if (days === 0) return '今天';
    if (days === 1) return '明天';
    return `${days} 天后`;
  };

  if (performances.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎤</div>
        <h3>暂无演出</h3>
        <p>还没有安排演出场次</p>
      </div>
    );
  }

  return (
    <div className="performance-timeline">
      {performances.map((perf, index) => {
        const past = isPast(perf.date);
        return (
          <div 
            key={perf.id} 
            className={`timeline-item ${past ? 'past' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="timeline-dot"></div>
            <div className="timeline-line"></div>
            
            <div className={`performance-card card ${past ? 'ended' : ''}`}>
              {past && (
                <span className="ended-badge">已结束</span>
              )}
              
              <div className="performance-header">
                <div className="performance-date">
                  <span className="date-day">{new Date(perf.date).getDate()}</span>
                  <span className="date-month">{new Date(perf.date).toLocaleString('zh-CN', { month: 'short' })}</span>
                </div>
                <div className="countdown">
                  <span className={`countdown-text ${past ? 'past' : ''}`}>
                    {formatCountdown(perf.date)}
                  </span>
                </div>
              </div>
              
              <div className="performance-body">
                {perf.workTitle && (
                  <span className="performance-work">《{perf.workTitle}》</span>
                )}
                <h4 className="performance-venue">{perf.venue}</h4>
                <p className="performance-full-date">{formatDate(perf.date)}</p>
              </div>
              
              <div className="performance-footer">
                {perf.ticketUrl ? (
                  <a 
                    href={perf.ticketUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    购票
                  </a>
                ) : (
                  <span className="no-ticket">暂无票务</span>
                )}
                {canEdit && onDelete && (
                  <button 
                    className="delete-btn"
                    onClick={() => onDelete(perf.id)}
                  >
                    删除
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PerformanceTimeline;
