import axios from 'axios';
import type { User, Task, Comment, Review, Stats } from '../types';

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const login = (username: string, password: string) => api.post<any>('/auth/login', { username, password });
export const register = (username: string, password: string) => api.post<any>('/auth/register', { username, password });
export const fetchUsers = () => api.get<User[]>('/users');
export const fetchTasks = () => api.get<Task[]>('/tasks');
export const createTask = (data: any) => api.post<Task>('/tasks', data);
export const updateTask = (id: string, data: any) => api.put<Task>(`/tasks/${id}`, data);
export const deleteTask = (id: string) => api.delete(`/tasks/${id}`);
export const addComment = (taskId: string, content: string, mentions: string[] = []) => api.post<Comment>(`/tasks/${taskId}/comments`, { content, mentions });
export const fetchComments = (taskId: string) => api.get<Comment[]>(`/tasks/${taskId}/comments`);
export const createReview = (data: any) => api.post<Review>('/reviews', data);
export const fetchReviews = () => api.get<Review[]>('/reviews');
export const fetchReview = (id: string) => api.get<Review>(`/reviews/${id}`);
export const addLineComment = (reviewId: string, fileId: string, line: number, content: string) => api.post(`/reviews/${reviewId}/comments`, { fileId, line, content });
export const updateReviewStatus = (id: string, status: string) => api.put(`/reviews/${id}/status`, { status });
export const fetchStats = () => api.get<Stats>('/stats');
