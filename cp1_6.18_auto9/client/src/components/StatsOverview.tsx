import React from 'react';
import type { Stats } from '../types';

interface StatsOverviewProps {
  stats: Stats;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const formatLastTime = (timeStr: string | null) => {
    if (!timeStr) return '暂无反馈';
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="stats-overview">
      <div className="stat-card">
        <div className="stat-card__label">本月已填写反馈</div>
        <div className="stat-card__value">{stats.submittedCount}</div>
        <div className="stat-card__subtitle">份反馈</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">平均评分</div>
        <div className="stat-card__value">{stats.averageRating.toFixed(1)}</div>
        <div className="stat-card__subtitle">满分 5.0</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">最近反馈</div>
        <div className="stat-card__value" style={{ fontSize: '20px' }}>
          {formatLastTime(stats.lastFeedbackTime)}
        </div>
        <div className="stat-card__subtitle">最后提交时间</div>
      </div>
    </div>
  );
};

export default StatsOverview;
