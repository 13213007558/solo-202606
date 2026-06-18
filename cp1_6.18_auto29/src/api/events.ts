import axios from 'axios';
import type { Event, User, Notification, AwardBadgesRequest } from '@/types';

const api = axios.create({
  baseURL: '/api',
});

export const fetchActivities = async (type?: string, status?: string): Promise<Event[]> => {
  const params: Record<string, string> = {};
  if (type) params.type = type;
  if (status) params.status = status;
  
  const response = await api.get('/events', { params });
  return response.data;
};

export const fetchActivityById = async (id: string): Promise<Event> => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

export const createActivity = async (eventData: Partial<Event>): Promise<Event> => {
  const response = await api.post('/events', eventData);
  return response.data;
};

export const joinActivity = async (eventId: string, userId: string): Promise<{ message: string; event: Event }> => {
  const response = await api.post(`/events/${eventId}/join`, { userId });
  return response.data;
};

export const awardBadges = async (
  eventId: string,
  data: AwardBadgesRequest
): Promise<{ message: string; results: { userId: string; success: boolean; message: string }[] }> => {
  const response = await api.post(`/events/${eventId}/awards`, data);
  return response.data;
};

export const fetchUser = async (userId: string): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const login = async (email: string, password: string): Promise<{ message: string; user: User }> => {
  const response = await api.post('/users/login', { email, password });
  return response.data;
};

export const register = async (
  username: string,
  email: string,
  password: string
): Promise<{ message: string; user: User }> => {
  const response = await api.post('/users/register', { username, email, password });
  return response.data;
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const response = await api.get(`/users/${userId}/notifications`);
  return response.data;
};

export const markNotificationRead = async (notificationId: string): Promise<{ message: string }> => {
  const response = await api.post(`/notifications/${notificationId}/read`);
  return response.data;
};

export default api;
