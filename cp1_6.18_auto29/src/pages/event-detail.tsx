import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, User, Award, CheckCircle, ArrowLeft } from 'lucide-react';
import { fetchActivityById, joinActivity, awardBadges, fetchUser } from '@/api/events';
import { useStore } from '@/store/useStore';
import type { Event } from '@/types';
import { formatDateTime, isEventFull, isEventEnded, cn } from '@/utils/helpers';
import CircularProgress from '@/components/CircularProgress';

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showAwardForm, setShowAwardForm] = useState(false);
  const [awardHours, setAwardHours] = useState(3);
  const [badgeName, setBadgeName] = useState('');
  const [badgeIcon, setBadgeIcon] = useState('star');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const isCreator = user?.id === event?.creatorId;
  const hasJoined = user?.id ? event?.participants.includes(user.id) : false;
  const isFull = event ? isEventFull(event.currentParticipants, event.maxParticipants) : false;
  const isEnded = event ? isEventEnded(event.dateTime) || event.status === 'ended' : false;
  
  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);
  
  const loadEvent = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await fetchActivityById(id);
      setEvent(data);
      setSelectedParticipants(data.participants);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoin = async () => {
    if (!id || !user) return;
    
    try {
      setJoining(true);
      await joinActivity(id, user.id);
      setMessage({ type: 'success', text: '报名成功！' });
      loadEvent();
      fetchUser(user.id).then(updatedUser => {
        useStore.getState().setUser(updatedUser);
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || '报名失败' });
    } finally {
      setJoining(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };
  
  const handleAward = async () => {
    if (!id || selectedParticipants.length === 0) return;
    
    try {
      await awardBadges(id, {
        participantIds: selectedParticipants,
        hours: awardHours,
        badgeName: badgeName || undefined,
        badgeIcon: badgeIcon || undefined,
      });
      setMessage({ type: 'success', text: '时长和徽章发放成功！' });
      setShowAwardForm(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || '发放失败' });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };
  
  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  const selectAllParticipants = () => {
    if (event) {
      setSelectedParticipants(
        selectedParticipants.length === event.participants.length
          ? []
          : [...event.participants]
      );
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-2xl mb-8" />
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">活动不存在</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-forest-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回</span>
      </button>
      
      {message && (
        <div className={cn(
          'mb-6 p-4 rounded-lg text-white font-medium animate-slide-down',
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        )}>
          {message.text}
        </div>
      )}
      
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8">
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <div className="flex items-start gap-3 mb-3">
            <span className="px-3 py-1 bg-wood-500 text-white text-sm font-medium rounded-full">
              {event.type === 'cleanup' && '清洁活动'}
              {event.type === 'planting' && '植树活动'}
              {event.type === 'education' && '宣传教育'}
              {event.type === 'other' && '其他活动'}
            </span>
            
            {isEnded && (
              <span className="px-3 py-1 bg-gray-500 text-white text-sm font-medium rounded-full">
                已结束
              </span>
            )}
            
            {isFull && !isEnded && (
              <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                已满员
              </span>
            )}
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold font-serif">{event.name}</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-forest-700 font-serif mb-4">
              活动详情
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-forest-700 font-serif mb-4">
              活动信息
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-forest-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-forest-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">活动地点</p>
                  <p className="text-sm font-medium text-gray-800">{event.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-forest-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-forest-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">活动时间</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatDateTime(event.dateTime)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-forest-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-forest-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">招募人数</p>
                  <p className="text-sm font-medium text-gray-800">
                    {event.currentParticipants} / {event.maxParticipants} 人
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-forest-100 rounded-lg flex items-center justify-center">
                  <CircularProgress
                    current={event.currentParticipants}
                    max={event.maxParticipants}
                    size={40}
                    strokeWidth={4}
                    color="#2D6B3B"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500">报名进度</p>
                  <p className="text-sm font-medium text-gray-800">
                    {Math.round((event.currentParticipants / event.maxParticipants) * 100)}% 已报名
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {isCreator && isEnded && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <button
                onClick={() => setShowAwardForm(!showAwardForm)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
              >
                <Award className="w-5 h-5" />
                发放时长和徽章
              </button>
              
              {showAwardForm && (
                <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in">
                  <h3 className="font-medium text-gray-800 mb-4">批量发放</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">发放时长（小时）</label>
                      <input
                        type="number"
                        value={awardHours}
                        onChange={(e) => setAwardHours(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
                        min={0.5}
                        step={0.5}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">徽章名称（可选）</label>
                      <input
                        type="text"
                        value={badgeName}
                        onChange={(e) => setBadgeName(e.target.value)}
                        placeholder="例如：环保先锋"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">选择参与者</label>
                      <button
                        onClick={selectAllParticipants}
                        className="text-sm text-forest-600 hover:underline mb-2"
                      >
                        {selectedParticipants.length === event.participants.length ? '取消全选' : '全选'}
                      </button>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {event.participantsDetails?.map(p => (
                          <label
                            key={p.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedParticipants.includes(p.id)}
                              onChange={() => toggleParticipant(p.id)}
                              className="w-4 h-4 text-forest-600 rounded focus:ring-forest-500"
                            />
                            <img src={p.avatar} alt={p.username} className="w-8 h-8 rounded-full" />
                            <span className="text-sm text-gray-700">{p.username}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleAward}
                      disabled={selectedParticipants.length === 0}
                      className={cn(
                        'w-full py-3 rounded-lg font-medium transition-colors',
                        selectedParticipants.length > 0
                          ? 'bg-forest-500 hover:bg-forest-600 text-white'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      确认发放（{selectedParticipants.length}人）
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-forest-700 font-serif">
                报名者
              </h2>
              <span className="text-sm text-gray-500">
                {event.currentParticipants}人
              </span>
            </div>
            
            <div className="space-y-3">
              {event.participantsDetails && event.participantsDetails.length > 0 ? (
                event.participantsDetails.slice(0, 10).map(p => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={p.avatar}
                      alt={p.username}
                      className="w-10 h-10 rounded-full border-2 border-forest-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {p.username}
                      </p>
                    </div>
                    {p.id === user?.id && (
                      <CheckCircle className="w-4 h-4 text-forest-500" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  暂无报名者
                </p>
              )}
              
              {event.participantsDetails && event.participantsDetails.length > 10 && (
                <p className="text-sm text-gray-400 text-center">
                  还有 {event.participantsDetails.length - 10} 人...
                </p>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              {!isLoggedIn ? (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-forest-500 hover:bg-forest-600 text-white font-medium rounded-lg transition-colors"
                >
                  登录后报名
                </button>
              ) : isCreator ? (
                <div className="text-center text-sm text-forest-600 font-medium">
                  👤 你是活动创建者
                </div>
              ) : hasJoined ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-forest-600 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    已报名
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    请准时参加活动
                  </p>
                </div>
              ) : isEnded ? (
                <button
                  disabled
                  className="w-full py-3 bg-gray-200 text-gray-400 font-medium rounded-lg cursor-not-allowed"
                >
                  活动已结束
                </button>
              ) : isFull ? (
                <button
                  disabled
                  className="w-full py-3 bg-gray-200 text-gray-400 font-medium rounded-lg cursor-not-allowed"
                >
                  活动已满员
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className={cn(
                    'w-full py-3 font-medium rounded-lg transition-colors',
                    joining
                      ? 'bg-gray-400 cursor-wait'
                      : 'bg-forest-500 hover:bg-forest-600'
                  )}
                >
                  {joining ? '报名中...' : '立即报名'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
