import { useState, useEffect } from 'react';
import { Bell, Award, Calendar, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { getNotifications, markNotificationRead } from '@/api/events';
import type { Notification } from '@/types';
import { cn } from '@/utils/helpers';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user, notifications, setNotifications, markNotificationRead: markRead } = useStore();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadNotifications();
  }, [user?.id]);
  
  const loadNotifications = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      markRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'badge':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-forest-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };
  
  const getBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50';
    switch (type) {
      case 'badge':
        return 'bg-yellow-50 border-l-yellow-500';
      case 'event':
        return 'bg-forest-50 border-l-forest-500';
      default:
        return 'bg-blue-50 border-l-blue-500';
    }
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-forest-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回</span>
      </button>
      
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-forest-600 to-forest-500 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-serif">通知中心</h1>
              <p className="text-forest-100 text-sm mt-1">
                {unreadCount > 0 ? `你有 ${unreadCount} 条未读消息` : '暂无未读消息'}
              </p>
            </div>
            <Bell className="w-10 h-10 text-forest-200" />
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-forest-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-400 text-sm mt-4">加载中...</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={cn(
                  'p-5 border-l-4 transition-all hover:bg-gray-50 cursor-pointer',
                  getBgColor(notification.type, notification.read),
                  notification.read && 'border-l-gray-200'
                )}
                onClick={() => !notification.read && handleMarkRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm',
                      notification.read ? 'text-gray-500' : 'text-gray-800 font-medium'
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-forest-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500">暂无通知</p>
              <p className="text-gray-400 text-sm mt-1">
                参与活动后会收到相关通知
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
