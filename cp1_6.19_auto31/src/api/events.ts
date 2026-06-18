import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

export interface JoinedEvent {
  eventId: string;
  eventName: string;
  hours: number;
  joinedAt: string;
  eventDate: string;
}

export interface Notification {
  id: string;
  type: 'badge' | 'hours' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  totalHours: number;
  badges: Badge[];
  joinedEvents: JoinedEvent[];
  notifications: Notification[];
}

export interface Event {
  id: string;
  name: string;
  location: string;
  dateTime: string;
  description: string;
  maxParticipants: number;
  currentParticipants: number;
  creatorId: string;
  creatorName: string;
  participants: { userId: string; username: string; avatar: string; hours?: number }[];
  badges: { name: string; icon: string; description: string }[];
  status: 'upcoming' | 'ongoing' | 'ended';
  image: string;
}

export const fetchActivities = async (status?: string, search?: string): Promise<Event[]> => {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (search) params.search = search;
  
  const response = await api.get('/events', { params });
  return response.data;
};

export const fetchActivityById = async (id: string): Promise<Event> => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

export const createActivity = async (data: {
  name: string;
  location: string;
  dateTime: string;
  description: string;
  maxParticipants: number;
  creatorId: string;
  creatorName: string;
  badges?: { name: string; icon: string; description: string }[];
}): Promise<Event> => {
  const response = await api.post('/events', data);
  return response.data;
};

export const joinActivity = async (eventId: string, userId: string): Promise<{ success: boolean; event: Event }> => {
  const response = await api.post(`/events/${eventId}/join`, { userId });
  return response.data;
};

export const awardActivity = async (
  eventId: string,
  data: { hours: number; badges: { name: string; icon: string; description: string }[]; creatorId: string }
): Promise<{ success: boolean }> => {
  const response = await api.post(`/events/${eventId}/award`, data);
  return response.data;
};

export const grantHoursAndBadge = awardActivity;

export const login = async (username: string, password: string): Promise<{ user: User }> => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const register = async (username: string, password: string): Promise<{ user: User }> => {
  const response = await api.post('/auth/register', { username, password });
  return response.data;
};

export const fetchUser = async (userId: string): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  const response = await api.get(`/users/${userId}/notifications`);
  return response.data;
};

export const markNotificationsRead = async (userId: string): Promise<{ success: boolean }> => {
  const response = await api.put(`/users/${userId}/notifications/read`);
  return response.data;
};
