import axios from 'axios';
import type { User, Task, Comment, Review, ReviewFile, ReviewLineComment, Stats, AuthResponse, Priority, TaskStatus, ReviewStatus } from '@/types';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', { username, password });
  return res.data.data;
};

export const register = async (username: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', { username, password });
  return res.data.data;
};

export const fetchUsers = async (): Promise<User[]> => {
  const res = await api.get('/auth/users');
  return res.data.data;
};

export const fetchTasks = async (): Promise<Task[]> => {
  const res = await api.get('/tasks');
  return res.data.data;
};

export const createTask = async (data: { title: string; description?: string; priority?: Priority; assigneeId?: string | null; dueDate?: string | null }): Promise<Task> => {
  const res = await api.post('/tasks', data);
  return res.data.data;
};

export const updateTask = async (id: string, data: Partial<Task>): Promise<Task> => {
  const res = await api.put(`/tasks/${id}`, data);
  return res.data.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const fetchTaskComments = async (taskId: string): Promise<Comment[]> => {
  const res = await api.get(`/tasks/${taskId}/comments`);
  return res.data.data;
};

export const addComment = async (taskId: string, content: string, mentions: string[] = []): Promise<Comment> => {
  const res = await api.post(`/tasks/${taskId}/comments`, { content, mentions });
  return res.data.data;
};

export const submitReview = async (taskId: string, files: ReviewFile[]): Promise<Review> => {
  const res = await api.post('/reviews', { taskId, files });
  return res.data.data;
};

export const fetchReview = async (id: string): Promise<Review> => {
  const res = await api.get(`/reviews/${id}`);
  return res.data.data;
};

export const fetchReviews = async (): Promise<Review[]> => {
  const res = await api.get('/reviews');
  return res.data.data;
};

export const addReviewLineComment = async (
  reviewId: string,
  fileIndex: number,
  lineNumber: number,
  content: string,
  status: 'approved' | 'changes-requested'
): Promise<ReviewLineComment> => {
  const res = await api.post(`/reviews/${reviewId}/comments`, { fileIndex, lineNumber, content, status });
  return res.data.data;
};

export const updateReviewStatus = async (reviewId: string, status: ReviewStatus): Promise<Review> => {
  const res = await api.put(`/reviews/${reviewId}/status`, { status });
  return res.data.data;
};

export const updateReview = async (id: string, data: Partial<Review>): Promise<Review> => {
  const res = await api.put(`/reviews/${id}`, data);
  return res.data.data;
};

export const fetchStats = async (): Promise<Stats> => {
  const res = await api.get('/stats');
  return res.data.data;
};
