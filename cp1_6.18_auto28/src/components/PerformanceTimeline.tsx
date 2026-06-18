import type { Performance } from '../types';

interface PerformanceTimelineProps {
  performances: Performance[];
}

export default function PerformanceTimeline({ performances }: PerformanceTimelineProps) {
  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const performanceDate = new Date(dateStr);
    performanceDate.setHours(0, 0, 0, 0);
    const diffTime = performanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleString('zh-CN', { month: 'short' }),
      year: date.getFullYear(),
    };
  };

  const sortedPerformances = [...performances].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (performances.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-illustration">🎫</div>
        <h3 className="empty-state-title">暂无演出安排</h3>
        <p className="empty-state-desc">关注音乐人，第一时间获取演出信息</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {sortedPerformances.map((perf) => {
        const daysUntil = getDaysUntil(perf.date);
        const isPast = daysUntil < 0;
        const dateInfo = formatDate(perf.date);

        return (
          <div key={perf.id} className={`timeline-item ${isPast ? 'past' : ''}`}>
            <div className="timeline-dot"></div>
            <div className={`card performance-card ${isPast ? 'past' : ''}`}>
              <div className="performance-date">
                <span className="performance-date-day">{dateInfo.day}</span>
                <div>
                  <div className="performance-date-month">{dateInfo.month}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {dateInfo.year}
                  </div>
                </div>
              </div>
              <h3 className="performance-title">{perf.title}</h3>
              {perf.location && (
                <div className="performance-location">
                  <span>📍</span>
                  <span>{perf.location}</span>
                </div>
              )}
              <div className="performance-footer">
                {isPast ? (
                  <span className="past-badge">已结束</span>
                ) : daysUntil === 0 ? (
                  <span className="countdown">今天!</span>
                ) : (
                  <span className="countdown">还有 {daysUntil} 天</span>
                )}
                {perf.ticketUrl && !isPast && (
                  <a
                    href={perf.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                  >
                    购票
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
