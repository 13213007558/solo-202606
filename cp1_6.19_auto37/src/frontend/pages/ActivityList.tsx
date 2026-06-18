import { useState, useEffect } from 'react';
import axios from 'axios';
import ActivityCard from '../components/ActivityCard';
import type { Activity } from '../types';

function ActivityList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/activities')
      .then((res) => setActivities(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="page-title">🌍 活动广场</h1>
      <p className="page-subtitle">每一份爱心都将汇聚成温暖的力量</p>
      {loading ? (
        <div className="empty-wall">
          <div className="empty-wall-icon">⏳</div>
          <div className="empty-wall-text">加载活动中...</div>
        </div>
      ) : activities.length === 0 ? (
        <div className="empty-wall">
          <div className="empty-wall-icon">🌟</div>
          <div className="empty-wall-text">暂无活动，点击右上角发起一个吧！</div>
        </div>
      ) : (
        <div className="activities-grid">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityList;
