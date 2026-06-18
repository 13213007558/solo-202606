import { useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { X } from 'lucide-react';
import type { Badge } from '@/types';
import { formatDate } from '@/utils/helpers';

interface BadgeModalProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BadgeModal = ({ badge, isOpen, onClose }: BadgeModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen || !badge) return null;
  
  const iconName = badge.icon.charAt(0).toUpperCase() + badge.icon.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[iconName] || LucideIcons.Star;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
      
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 shadow-lg flex items-center justify-center border-4 border-yellow-300 animate-float">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: badge.color || '#2D6B3B' }}
              >
                <IconComponent size={40} className="text-white" />
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              成就达成
            </div>
          </div>
          
          <h3 className="mt-6 text-xl font-bold text-forest-700 font-serif">
            {badge.name}
          </h3>
          
          <p className="mt-2 text-gray-600 text-center">
            {badge.description}
          </p>
          
          <div className="mt-4 pt-4 border-t border-gray-100 w-full">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">获得时间</span>
              <span className="text-forest-600 font-medium">
                {formatDate(badge.awardedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeModal;
