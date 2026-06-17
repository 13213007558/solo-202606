import React, { useRef, useEffect, useState } from 'react';

interface FoodDetail {
  name: string;
  portion: '小份' | '中份' | '大份';
}

interface Activity {
  id: string;
  petId: string;
  type: '饮食' | '运动' | '医疗' | '健康检查';
  note: string;
  timestamp: string;
  food?: FoodDetail;
  archived: boolean;
}

interface ActivityLogProps {
  activities: Activity[];
  onContextMenu: (e: React.MouseEvent, activityId: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  '饮食': '#4CAF50',
  '运动': '#FF9800',
  '医疗': '#F44336',
  '健康检查': '#2196F3',
};

const TYPE_ICONS: Record<string, string> = {
  '饮食': '🍖',
  '运动': '🏃',
  '医疗': '💊',
  '健康检查': '🩺',
};

function formatTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `今天 ${time}`;
  if (isYesterday) return `昨天 ${time}`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) + ' ' + time;
}

export default function ActivityLog({ activities, onContextMenu }: ActivityLogProps) {
  const [visibleCount, setVisibleCount] = useState(20);
  const listRef = useRef<HTMLDivElement>(null);
  const [newItems, setNewItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (activities.length > 0) {
      const newestIds = new Set(activities.slice(0, 3).map((a) => a.id));
      setNewItems(newestIds);
      const timer = setTimeout(() => setNewItems(new Set()), 600);
      return () => clearTimeout(timer);
    }
  }, [activities.length]);

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100 && visibleCount < activities.length) {
      setVisibleCount((prev) => Math.min(prev + 10, activities.length));
    }
  };

  const visible = activities.slice(0, visibleCount);
  const archived = visible.filter((a) => a.archived);
  const active = visible.filter((a) => !a.archived);
  const sorted = [...active, ...archived];

  return (
    <div className="activity-log" ref={listRef} onScroll={handleScroll}>
      {sorted.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <p>暂无活动记录</p>
          <p className="empty-hint">点击右下角按钮添加第一条记录</p>
        </div>
      )}
      {sorted.map((activity, index) => (
        <div
          key={activity.id}
          className={`activity-item ${activity.archived ? 'archived' : ''} ${newItems.has(activity.id) ? 'slide-in' : ''}`}
          style={{ backgroundColor: index % 2 === 0 ? '#F1F8E9' : '#FFFFFF' }}
          onContextMenu={(e) => onContextMenu(e, activity.id)}
        >
          <div className="activity-type-badge" style={{ backgroundColor: TYPE_COLORS[activity.type] + '20', color: TYPE_COLORS[activity.type] }}>
            <span>{TYPE_ICONS[activity.type]}</span>
            <span>{activity.type}</span>
          </div>
          <div className="activity-content">
            {activity.note && <p className="activity-note">{activity.note}</p>}
            {activity.type === '饮食' && activity.food && (
              <p className="activity-food">
                🍽 {activity.food.name} · {activity.food.portion}
              </p>
            )}
            <span className="activity-time">{formatTime(activity.timestamp)}</span>
          </div>
          {activity.archived && <span className="archived-badge">已归档</span>}
        </div>
      ))}
    </div>
  );
}
