import { useEffect, useState } from 'react';
import { Bell, Award, Calendar, X } from 'lucide-react';
import type { Notification } from '@/types';

interface NotificationToastProps {
  notification: Notification | null;
  onClose: () => void;
  duration?: number;
}

export const NotificationToast = ({ notification, onClose, duration = 5000 }: NotificationToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [notification, duration, onClose]);
  
  if (!notification) return null;
  
  const getIcon = () => {
    switch (notification.type) {
      case 'badge':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-forest-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };
  
  const getBgColor = () => {
    switch (notification.type) {
      case 'badge':
        return 'border-l-yellow-500';
      case 'event':
        return 'border-l-forest-500';
      default:
        return 'border-l-blue-500';
    }
  };
  
  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 transform ${
        isVisible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`bg-white rounded-lg shadow-lg border-l-4 ${getBgColor()} p-4 pr-10 min-w-72`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              {notification.message}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(notification.createdAt).toLocaleString('zh-CN')}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
