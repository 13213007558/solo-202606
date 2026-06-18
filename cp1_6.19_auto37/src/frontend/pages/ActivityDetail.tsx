import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import DonationWall from '../components/DonationWall';
import DonatePanel from '../components/DonatePanel';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useCountdown } from '../hooks/useCountdown';
import type { Activity, Donation, ActivityStats } from '../types';

const FAR_FUTURE = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10).toISOString();

function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [stats, setStats] = useState<ActivityStats>({
    totalAmount: 0,
    donorCount: 0,
    achievementRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const countdown = useCountdown(activity?.deadline || FAR_FUTURE);

  useEffect(() => {
    if (!id) return;
    axios.get(`/api/activity/${id}`)
      .then((res) => {
        setActivity(res.data);
        setStats({
          totalAmount: res.data.totalAmount || 0,
          donorCount: res.data.donorCount || 0,
          achievementRate: res.data.achievementRate || 0,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDonationSuccess = useCallback((_donation: Donation, newStats: ActivityStats) => {
    setStats(newStats);
  }, []);

  const animatedAmount = useAnimatedNumber(stats.totalAmount);
  const animatedCount = useAnimatedNumber(stats.donorCount);
  const animatedRate = useAnimatedNumber(stats.achievementRate);

  if (loading) {
    return (
      <div className="empty-wall">
        <div className="empty-wall-icon">⏳</div>
        <div className="empty-wall-text">加载中...</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="empty-wall">
        <div className="empty-wall-icon">😢</div>
        <div className="empty-wall-text">活动不存在</div>
        <Link to="/list" className="btn btn-primary" style={{ marginTop: 20 }}>
          返回活动广场
        </Link>
      </div>
    );
  }

  const formatCountdown = () => {
    if (countdown.isExpired) return '已结束';
    if (!activity) return '';
    const parts: string[] = [];
    if (countdown.days > 0) parts.push(`${countdown.days}天`);
    parts.push(
      `${String(countdown.hours).padStart(2, '0')}:${String(countdown.minutes).padStart(2, '0')}:${String(countdown.seconds).padStart(2, '0')}`
    );
    return parts.join(' ');
  };

  return (
    <div className="activity-detail">
      <Link to="/list" className="back-link">← 返回活动广场</Link>
      <div className="activity-header">
        <h1 className="activity-title">{activity.name}</h1>
        <div className="activity-meta">
          <div className="meta-item">👤 {activity.creatorName}</div>
          <div className={`meta-item ${countdown?.isUrgent ? 'countdown-urgent' : ''}`}>
            ⏱ 剩余：{formatCountdown()}
          </div>
          <div className="meta-item">🎯 目标：¥{activity.targetAmount.toLocaleString()}</div>
        </div>
        <div className="activity-description">{activity.description}</div>
        <div className="stats-panel">
          <div className="stat-card">
            <div className="stat-value">{Math.round(animatedCount)}</div>
            <div className="stat-label">爱心人数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">¥{Math.round(animatedAmount).toLocaleString()}</div>
            <div className="stat-label">已筹金额</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{animatedRate.toFixed(1)}%</div>
            <div className="stat-label">达成率</div>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div>
          {id && <DonationWall activityId={id} />}
        </div>
        {id && (
          <DonatePanel
            activityId={id}
            onDonationSuccess={handleDonationSuccess}
          />
        )}
      </div>
    </div>
  );
}

export default ActivityDetail;
