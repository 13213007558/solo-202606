import { useState, useEffect } from 'react';
import { Calendar, Award, Clock, User as UserIcon, Settings } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { fetchUser } from '@/api/events';
import ProgressRing from '@/components/ProgressRing';
import BadgeCard from '@/components/BadgeCard';
import BadgeModal from '@/components/BadgeModal';
import type { Badge, User } from '@/types';
import { formatDate } from '@/utils/helpers';

const ProfilePage = () => {
  const { user: storeUser, isLoggedIn } = useStore();
  const [user, setUser] = useState<User | null>(storeUser);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'badges' | 'history'>('badges');
  
  useEffect(() => {
    if (storeUser?.id) {
      loadUserProfile();
    }
  }, [storeUser?.id]);
  
  const loadUserProfile = async () => {
    if (!storeUser?.id) return;
    try {
      const data = await fetchUser(storeUser.id);
      setUser(data);
      useStore.getState().setUser(data);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };
  
  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsBadgeModalOpen(true);
  };
  
  const sortedBadges = user?.badges
    ? [...user.badges].sort((a, b) => 
        new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime()
      )
    : [];
  
  const sortedEvents = user?.joinedEvents
    ? [...user.joinedEvents].sort((a, b) => 
        new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
      )
    : [];
  
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-forest-600 to-forest-500 h-32 relative">
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 400 100" className="w-full h-full">
              <path
                d="M0,50 Q50,20 100,50 T200,50 T300,50 T400,50 L400,100 L0,100 Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
        
        <div className="px-6 pb-6 -mt-16 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
              <img
                src={user?.avatar}
                alt={user?.username}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 font-serif">
                {user?.username}
              </h1>
              <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
            </div>
            
            <button className="sm:self-start p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h2 className="text-lg font-bold text-forest-700 font-serif mb-6 text-center">
              志愿时长
            </h2>
            
            <div className="flex justify-center mb-4">
              <ProgressRing
                key={user?.totalHours}
                progress={user?.totalHours || 0}
                size={160}
                strokeWidth={10}
                color="#2D6B3B"
                label="总时长(小时)"
                maxValue={100}
                animate={true}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-wood-600">
                  {user?.joinedEvents.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">参与活动</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">
                  {user?.badges.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">获得徽章</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('badges')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'badges'
                    ? 'text-forest-600 border-b-2 border-forest-500 bg-forest-50/30'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Award className="w-4 h-4" />
                徽章收藏
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'history'
                    ? 'text-forest-600 border-b-2 border-forest-500 bg-forest-50/30'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                活动记录
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'badges' ? (
                sortedBadges.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 justify-items-center">
                    {sortedBadges.map((badge) => (
                      <div key={badge.id} className="flex flex-col items-center">
                        <BadgeCard
                          badge={badge}
                          size="lg"
                          onClick={() => handleBadgeClick(badge)}
                        />
                        <p className="mt-2 text-sm font-medium text-gray-700 text-center">
                          {badge.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(badge.awardedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-yellow-500" />
                    </div>
                    <p className="text-gray-500">还没有获得徽章</p>
                    <p className="text-gray-400 text-sm mt-1">
                      参与更多活动来解锁徽章吧！
                    </p>
                  </div>
                )
              ) : (
                sortedEvents.length > 0 ? (
                  <div className="space-y-4">
                    {sortedEvents.map((event, index) => (
                      <div
                        key={`${event.eventId}-${index}`}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-12 h-12 bg-forest-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-6 h-6 text-forest-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {event.eventName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(event.joinedAt)}
                          </p>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-forest-600">
                            {event.hours > 0 ? `${event.hours}h` : '待记录'}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            event.status === 'completed'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {event.status === 'completed' ? '已完成' : '已报名'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-forest-500" />
                    </div>
                    <p className="text-gray-500">还没有参与活动</p>
                    <p className="text-gray-400 text-sm mt-1">
                      去活动墙看看有什么感兴趣的活动吧
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      
      <BadgeModal
        badge={selectedBadge}
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
