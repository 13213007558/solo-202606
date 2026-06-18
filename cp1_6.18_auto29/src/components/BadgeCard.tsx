import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import type { Badge } from '@/types';
import { formatDate } from '@/utils/helpers';

interface BadgeCardProps {
  badge: Badge;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const BadgeCard = ({ badge, onClick, size = 'md' }: BadgeCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };
  
  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 40,
  };
  
  const iconName = badge.icon.charAt(0).toUpperCase() + badge.icon.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[iconName] || LucideIcons.Star;
  
  return (
    <div
      className={`relative perspective-1000 cursor-pointer ${sizeClasses[size]}`}
      onClick={onClick}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div
          className="absolute inset-0 backface-hidden rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 shadow-lg flex items-center justify-center border-4 border-yellow-300"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            className="rounded-full flex items-center justify-center"
            style={{
              backgroundColor: badge.color || '#2D6B3B',
              width: size === 'sm' ? '48px' : size === 'md' ? '60px' : '84px',
              height: size === 'sm' ? '48px' : size === 'md' ? '60px' : '84px',
            }}
          >
            <IconComponent size={iconSizes[size]} className="text-white" />
          </div>
        </div>
        
        <div
          className="absolute inset-0 backface-hidden rounded-full bg-gradient-to-br from-forest-500 to-forest-700 shadow-lg flex flex-col items-center justify-center p-2 text-white"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <p className={`font-bold text-center leading-tight ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          }`}>
            {badge.name}
          </p>
          {size !== 'sm' && (
            <p className="text-xs text-forest-200 mt-1 text-center line-clamp-2">
              {badge.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgeCard;
