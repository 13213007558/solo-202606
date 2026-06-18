import axios from 'axios';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface ParticipantInfo {
  id: string;
  username: string;
  avatar: string;
  totalHours: number;
}

export interface CreatorInfo {
  id: string;
  username: string;
  avatar: string;
  totalHours: number;
}

export interface Activity {
  id: string;
  creatorId: string;
  name: string;
  location: string;
  date: string;
  time: string;
  description: string;
  maxParticipants: number;
  participants: string[];
  status: 'open' | 'full' | 'ended';
  durationHours: number;
  badges: Badge[];
  imageUrl: string;
  creator?: CreatorInfo;
  participantInfos?: ParticipantInfo[];
}

export interface UserBadge {
  badgeId: string;
  earnedAt: string;
  name: string;
  icon: string;
  description: string;
}

export interface JoinedActivity {
  activityId: string;
  name: string;
  date: string;
  hours: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  totalHours: number;
  badges: UserBadge[];
  joinedActivities: JoinedActivity[];
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const fetchActivities = (): Promise<Activity[]> =>
  api.get('/activities').then((res) => res.data);

export const fetchActivity = (id: string): Promise<Activity> =>
  api.get(`/activities/${id}`).then((res) => res.data);

export const createActivity = (data: Partial<Activity>): Promise<Activity> =>
  api.post('/activities', data).then((res) => res.data);

export const joinActivity = (id: string, userId: string): Promise<Activity> =>
  api.post(`/activities/${id}/join`, { userId }).then((res) => res.data);

export const distributeRewards = (
  id: string,
  hours: number,
  badge?: Badge
): Promise<Activity> =>
  api.post(`/activities/${id}/distribute`, { hours, badge }).then((res) => res.data);

export const login = (username: string, password: string): Promise<{ id: string; username: string; avatar: string }> =>
  api.post('/auth/login', { username, password }).then((res) => res.data);

export const register = (username: string, password: string): Promise<{ id: string; username: string; avatar: string }> =>
  api.post('/auth/register', { username, password }).then((res) => res.data);

export const fetchUserProfile = (id: string): Promise<UserProfile> =>
  api.get(`/users/${id}`).then((res) => res.data);

export const fetchNotifications = (userId: string): Promise<Notification[]> =>
  api.get(`/users/${userId}/notifications`).then((res) => res.data);

export const markNotificationRead = (id: string): Promise<void> =>
  api.put(`/notifications/${id}/read`).then((res) => res.data);
