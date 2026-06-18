import { useState, useEffect } from 'react';
import { Search, Filter, Leaf, TreeDeciduous, Recycle, Sparkles } from 'lucide-react';
import { fetchActivities } from '@/api/events';
import { useStore } from '@/store/useStore';
import EventCard from '@/components/EventCard';
import CountdownCard from '@/components/CountdownCard';
import type { Event } from '@/types';
import { cn, getDaysRemaining } from '@/utils/helpers';

const HomePage = () => {
  const { user, isLoggedIn } = useStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  
  useEffect(() => {
    loadEvents();
  }, [activeType, activeStatus]);
  
  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchActivities(
        activeType === 'all' ? undefined : activeType,
        activeStatus === 'all' ? undefined : activeStatus
      );
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const upcomingEvents = isLoggedIn && user
    ? events.filter(e => 
        e.status === 'upcoming' && 
        e.participants.includes(user.id) &&
        getDaysRemaining(e.dateTime) > 0
      ).slice(0, 3)
    : [];
  
  const typeFilters = [
    { value: 'all', label: '全部', icon: Sparkles },
    { value: 'cleanup', label: '清洁活动', icon: Recycle },
    { value: 'planting', label: '植树活动', icon: TreeDeciduous },
    { value: 'education', label: '宣传教育', icon: Leaf },
  ];
  
  const statusFilters = [
    { value: 'all', label: '全部状态' },
    { value: 'upcoming', label: '即将开始' },
    { value: 'ended', label: '已结束' },
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-12">
        <div className="bg-gradient-to-r from-forest-600 to-forest-500 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold font-serif mb-3">
              用行动守护绿色家园
            </h1>
            <p className="text-forest-100 text-lg max-w-xl">
              加入环保志愿活动，记录你的每一份贡献，让地球因你而更美好
            </p>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 opacity-20">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="80" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute right-20 bottom-0 w-32 h-32 opacity-20">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="80" fill="currentColor" />
            </svg>
          </div>
        </div>
      </section>
      
      {isLoggedIn && upcomingEvents.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-forest-700 font-serif mb-4">
            我的即将开始
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map(event => (
              <CountdownCard
                key={event.id}
                eventId={event.id}
                eventName={event.name}
                eventDateTime={event.dateTime}
              />
            ))}
          </div>
        </section>
      )}
      
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-forest-700 font-serif">
            活动墙
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索活动..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {typeFilters.map(filter => (
            <button
              key={filter.value}
              onClick={() => setActiveType(filter.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                activeType === filter.value
                  ? 'bg-forest-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-forest-50 border border-gray-200'
              )}
            >
              <filter.icon className="w-4 h-4" />
              {filter.label}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 mb-6">
          {statusFilters.map(filter => (
            <button
              key={filter.value}
              onClick={() => setActiveStatus(filter.value)}
              className={cn(
                'px-3 py-1 rounded-lg text-sm transition-all',
                activeStatus === filter.value
                  ? 'text-forest-600 font-medium border-b-2 border-forest-500'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-forest-500" />
            </div>
            <p className="text-gray-500">暂无符合条件的活动</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
