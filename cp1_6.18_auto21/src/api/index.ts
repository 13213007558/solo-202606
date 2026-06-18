import axios from 'axios';
import type { User, Task, Comment, Review, ReviewComment, Stats } from '@/types';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: (data: { username: string; password: string }) => api.post<{ user: User; token: string }>('/auth/register', data),
  login: (data: { username: string; password: string }) => api.post<{ user: User; token: string }>('/auth/login', data),
  getUsers: () => api.get<User[]>('/auth/users'),
};

export const taskApi = {
  fetchTasks: () => api.get<Task[]>('/tasks'),
  createTask: (data: Partial<Task>) => api.post<Task>('/tasks', data),
  updateTask: (id: string, data: Partial<Task>) => api.put<Task>(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  fetchComments: (taskId: string) => api.get<Comment[]>(`/tasks/${taskId}/comments`),
  addComment: (taskId: string, data: { content: string; mentions: string[] }) => api.post<Comment>(`/tasks/${taskId}/comments`, data),
};

export const reviewApi = {
  createReview: (data: { taskId: string; files: { name: string; content: string }[] }) => api.post<Review>('/reviews', data),
  getReview: (id: string) => api.get<Review>(`/reviews/${id}`),
  addComment: (reviewId: string, data: { fileIndex: number; lineNumber: number; content: string; status: 'approved' | 'changes-requested' }) => api.post<ReviewComment>(`/reviews/${reviewId}/comments`, data),
  updateStatus: (reviewId: string, data: { status: 'pending' | 'approved' | 'changes-requested' }) => api.put(`/reviews/${reviewId}/status`, data),
};

export const statsApi = {
  getStats: () => api.get<Stats>('/stats'),
};
