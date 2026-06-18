import { getDaysRemaining, cn } from '@/utils/helpers';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CountdownCardProps {
  eventId: string;
  eventName: string;
  eventDateTime: string;
}

export const CountdownCard = ({ eventId, eventName, eventDateTime }: CountdownCardProps) => {
  const days = getDaysRemaining(eventDateTime);
  
  const getGradientClass = () => {
    if (days <= 0) return 'from-red-500 to-red-700';
    if (days <= 3) return 'from-orange-400 to-red-500';
    if (days <= 7) return 'from-yellow-400 to-orange-500';
    return 'from-green-400 to-forest-600';
  };
  
  return (
    <Link
      to={`/events/${eventId}`}
      className={cn(
        'relative overflow-hidden rounded-xl p-4 text-white shadow-md',
        'bg-gradient-to-br transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        getGradientClass()
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm opacity-90">距离活动开始</p>
          <p className="text-3xl font-bold mt-1">
            {days <= 0 ? '0' : days}
            <span className="text-base font-normal ml-1">天</span>
          </p>
        </div>
        <Clock className="w-6 h-6 opacity-70" />
      </div>
      
      <p className="mt-3 text-sm font-medium line-clamp-2">
        {eventName}
      </p>
      
      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
      <div className="absolute -right-2 -top-2 w-12 h-12 bg-white/10 rounded-full" />
    </Link>
  );
};

export default CountdownCard;
