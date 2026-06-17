import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCardData } from '@/types';
import { getDaysRemaining, isUrgentEvent } from '@/utils/helpers';
import './EventCard.css';

interface EventCardProps {
  event: EventCardData;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const daysRemaining = getDaysRemaining(event.date);
  const isUrgent = isUrgentEvent(event.date);

  const handleClick = () => {
    navigate(`/event/${event.id}`);
  };

  const displayMembers = Math.min(event.memberCount, 3);
  const extraMembers = event.memberCount - displayMembers;

  return (
    <div className="event-card" onClick={handleClick}>
      <div className="event-card__cover">
        <img
          src={event.coverImages[0]}
          alt={event.name}
          className="event-card__image"
        />
        <div className="event-card__overlay" />

        <div className={`event-card__type-tag ${event.isPublic ? 'public' : 'private'}`}>
          {event.isPublic ? '公开' : '私密'}
        </div>

        <div className="event-card__bottom">
          <h3 className="event-card__title">{event.name}</h3>

          <div className="event-card__tags">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="event-card__tag">
                {tag}
              </span>
            ))}
          </div>

          <div className="event-card__info">
            <div className="event-card__location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{event.location}</span>
            </div>

            <div className="event-card__members">
              <div className="event-card__avatars">
                {Array.from({ length: displayMembers }).map((_, i) => (
                  <div key={i} className="event-card__avatar">
                    <img
                      src={`https://i.pravatar.cc/40?img=${(i + 1) * 5}`}
                      alt="成员头像"
                    />
                  </div>
                ))}
                {extraMembers > 0 && (
                  <div className="event-card__avatar event-card__avatar--more">
                    +{extraMembers}
                  </div>
                )}
              </div>
              <span className="event-card__member-count">{event.memberCount}人参与</span>
            </div>

            <div className={`event-card__days ${isUrgent ? 'urgent' : ''}`}>
              <span className="event-card__days-number">{daysRemaining}</span>
              <span className="event-card__days-label">天后</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
