import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users } from 'lucide-react';
import type { Event } from '@/types';
import { formatDate, formatTime, isEventFull, isEventEnded, cn } from '@/utils/helpers';
import CircularProgress from './CircularProgress';

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const isFull = isEventFull(event.currentParticipants, event.maxParticipants);
  const isEnded = isEventEnded(event.dateTime) || event.status === 'ended';
  const isDisabled = isFull || isEnded;
  
  return (
    <Link
      to={`/events/${event.id}`}
      className={cn(
        'group block bg-white rounded-xl overflow-hidden shadow-md',
        'transition-all duration-300 ease-out',
        'hover:shadow-xl hover:-translate-y-1',
        isDisabled && 'opacity-60 pointer-events-none'
      )}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.name}
          className={cn(
            'w-full h-full object-cover transition-transform duration-500',
            'group-hover:scale-105',
            isDisabled && 'grayscale'
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {isFull && !isEnded && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            已满员
          </div>
        )}
        
        {isEnded && (
          <div className="absolute top-3 right-3 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            已结束
          </div>
        )}
        
        {!isDisabled && (
          <div className="absolute top-3 left-3 bg-wood-500 text-white text-xs font-medium px-3 py-1 rounded-full">
          {event.type === 'cleanup' && '清洁活动'}
          {event.type === 'planting' && '植树活动'}
          {event.type === 'education' && '宣传教育'}
          {event.type === 'other' && '其他活动'}
        </div>
        )}
        
        <h3 className="absolute bottom-3 left-4 right-4 text-white font-bold text-lg font-serif line-clamp-2">
          {event.name}
        </h3>
      </div>
      
      <div className="p-4">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-forest-500" />
          <span className="truncate">{event.location}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-forest-500" />
          <span>{formatDate(event.dateTime)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-forest-500" />
          <span>{formatTime(event.dateTime)}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {event.currentParticipants}/{event.maxParticipants} 人
          </span>
        </div>
        
        <CircularProgress
          current={event.currentParticipants}
          max={event.maxParticipants}
          size={36}
          strokeWidth={4}
          color={isFull ? '#ef4444' : '#2D6B3B'}
        />
      </div>
    </div>
    </Link>
  );
};

export default EventCard;
