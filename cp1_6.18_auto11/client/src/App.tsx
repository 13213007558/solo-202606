import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PetCard from './components/PetCard';
import ActivityLog from './components/ActivityLog';
import HealthTrend from './components/HealthTrend';

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

interface PetSummary {
  id: string;
  name: string;
  breed: string;
  avatar: string;
  weight: number;
  lastActivityTime: string | null;
  activityCount: number;
}

interface TrendPoint {
  date: string;
  weight: number;
  exerciseMinutes: number;
  foodAmount: number;
}

type ViewMode = 'dashboard' | 'detail';
type DetailTab = 'activities' | 'trends';
type ActivityType = '饮食' | '运动' | '医疗' | '健康检查';

const AVATAR_EMOJIS: Record<string, string> = {
  '金毛寻回犬': '🐕',
  '英短蓝猫': '🐱',
  '柯基犬': '🐶',
};

function getTimeAgo(timestamp: string | null): string {
  if (!timestamp) return '暂无活动';
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  '饮食': '🍖',
  '运动': '🏃',
  '医疗': '💊',
  '健康检查': '🩺',
};

export default function App() {
  const [pets, setPets] = useState<PetSummary[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetSummary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [tab, setTab] = useState<DetailTab>('activities');
  const [showModal, setShowModal] = useState(false);
  const [trendDays, setTrendDays] = useState<7 | 30>(7);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; activityId: string } | null>(null);

  const fetchPets = useCallback(async () => {
    const res = await axios.get('/api/pets');
    setPets(res.data);
  }, []);

  const fetchActivities = useCallback(async (petId: string) => {
    const res = await axios.get(`/api/pets/${petId}`);
    setActivities(res.data.activities);
  }, []);

  const fetchTrends = useCallback(async (petId: string, days: number) => {
    const res = await axios.get(`/api/trends?petId=${petId}&days=${days}`);
    setTrends(res.data);
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  useEffect(() => {
    if (selectedPet) {
      fetchActivities(selectedPet.id);
      fetchTrends(selectedPet.id, trendDays);
    }
  }, [selectedPet, trendDays, fetchActivities, fetchTrends]);

  const handlePetClick = (pet: PetSummary) => {
    setSelectedPet(pet);
    setView('detail');
    setTab('activities');
  };

  const handleBack = () => {
    setView('dashboard');
    setSelectedPet(null);
    setActivities([]);
    setTrends([]);
    fetchPets();
  };

  const handleAddActivity = async (data: {
    type: ActivityType;
    note: string;
    timestamp: string;
    food?: FoodDetail;
  }) => {
    if (!selectedPet) return;
    await axios.post('/api/activities', {
      petId: selectedPet.id,
      ...data,
    });
    await fetchActivities(selectedPet.id);
    await fetchTrends(selectedPet.id, trendDays);
    setShowModal(false);
  };

  const handleDeleteActivity = async (id: string) => {
    if (!selectedPet) return;
    await axios.delete(`/api/activities/${id}`);
    await fetchActivities(selectedPet.id);
    setContextMenu(null);
  };

  const handleArchiveActivity = async (id: string, archived: boolean) => {
    if (!selectedPet) return;
    await axios.patch(`/api/activities/${id}`, { archived });
    await fetchActivities(selectedPet.id);
    setContextMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent, activityId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, activityId });
  };

  const closeContextMenu = () => setContextMenu(null);

  const activityEmoji = selectedPet
    ? AVATAR_EMOJIS[selectedPet.breed] || '🐾'
    : '🐾';

  if (view === 'dashboard') {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>🐾 PawTrack</h1>
          <p>宠物日常记录与健康追踪</p>
        </header>
        <div className="pet-grid">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              timeAgo={getTimeAgo(pet.lastActivityTime)}
              emoji={AVATAR_EMOJIS[pet.breed] || '🐾'}
              onClick={handlePetClick}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="detail-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <div className="detail-pet-info">
          <span className="detail-avatar">{activityEmoji}</span>
          <div>
            <h2>{selectedPet?.name}</h2>
            <span className="breed-tag">{selectedPet?.breed}</span>
          </div>
        </div>
      </header>

      <div className="tab-bar">
        <button
          className={`tab-btn ${tab === 'activities' ? 'active' : ''}`}
          onClick={() => setTab('activities')}
        >
          📋 活动记录
        </button>
        <button
          className={`tab-btn ${tab === 'trends' ? 'active' : ''}`}
          onClick={() => setTab('trends')}
        >
          📈 健康趋势
        </button>
      </div>

      {tab === 'activities' ? (
        <ActivityLog
          activities={activities}
          onContextMenu={handleContextMenu}
        />
      ) : (
        <HealthTrend
          trends={trends}
          days={trendDays}
          onDaysChange={setTrendDays}
        />
      )}

      {tab === 'activities' && (
        <button className="fab" onClick={() => setShowModal(true)}>
          ＋
        </button>
      )}

      {showModal && (
        <AddActivityModal
          onSubmit={handleAddActivity}
          onClose={() => setShowModal(false)}
        />
      )}

      {contextMenu && (
        <>
          <div className="context-overlay" onClick={closeContextMenu} />
          <div
            className="context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button onClick={() => handleDeleteActivity(contextMenu.activityId)}>
              🗑️ 删除
            </button>
            {(() => {
              const act = activities.find((a) => a.id === contextMenu.activityId);
              return act ? (
                <button onClick={() => handleArchiveActivity(act.id, !act.archived)}>
                  {act.archived ? '↩️ 恢复' : '📦 归档'}
                </button>
              ) : null;
            })()}
          </div>
        </>
      )}
    </div>
  );
}

function AddActivityModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (data: {
    type: ActivityType;
    note: string;
    timestamp: string;
    food?: FoodDetail;
  }) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<ActivityType>('饮食');
  const [note, setNote] = useState('');
  const [timestamp, setTimestamp] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [foodName, setFoodName] = useState('');
  const [foodPortion, setFoodPortion] = useState<'小份' | '中份' | '大份'>('中份');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: {
      type: ActivityType;
      note: string;
      timestamp: string;
      food?: FoodDetail;
    } = {
      type,
      note,
      timestamp: new Date(timestamp).toISOString(),
    };
    if (type === '饮食' && foodName) {
      data.food = { name: foodName, portion: foodPortion };
    }
    onSubmit(data);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>📝 添加活动记录</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>活动类型</label>
            <div className="type-selector">
              {(Object.keys(ACTIVITY_ICONS) as ActivityType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`type-btn ${type === t ? 'active' : ''}`}
                  onClick={() => setType(t)}
                >
                  {ACTIVITY_ICONS[t]} {t}
                </button>
              ))}
            </div>
          </div>

          {type === '饮食' && (
            <div className="food-subform">
              <div className="form-group">
                <label>食物名称</label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="例如：皇家狗粮"
                />
              </div>
              <div className="form-group">
                <label>份量</label>
                <select
                  value={foodPortion}
                  onChange={(e) => setFoodPortion(e.target.value as '小份' | '中份' | '大份')}
                >
                  <option value="小份">小份</option>
                  <option value="中份">中份</option>
                  <option value="大份">大份</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>备注（可选）</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录一些详细信息..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>时间</label>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-submit">
              提交
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
