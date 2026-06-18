export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  totalHours: number;
  badges: Badge[];
  joinedEvents: JoinedEvent[];
}

export interface Event {
  id: string;
  name: string;
  location: string;
  dateTime: string;
  description: string;
  maxParticipants: number;
  currentParticipants: number;
  participants: string[];
  participantsDetails?: { id: string; username: string; avatar: string }[];
  creatorId: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  type: 'cleanup' | 'planting' | 'education' | 'other';
  image: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  awardedAt: string;
  eventId?: string;
}

export interface JoinedEvent {
  eventId: string;
  eventName: string;
  hours: number;
  joinedAt: string;
  status: 'registered' | 'completed';
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'badge' | 'event' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AwardBadgesRequest {
  participantIds: string[];
  hours: number;
  badgeName?: string;
  badgeIcon?: string;
  badgeDescription?: string;
}
