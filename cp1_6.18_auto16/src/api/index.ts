import axios, { AxiosInstance } from 'axios';
import type { User, Task, Comment, Review, Stats, ReviewFile } from '../types';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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

export const login = (username: string, password: string) => {
  return api.post<{ token: string; user: User }>('/auth/login', { username, password });
};

export const register = (username: string, password: string) => {
  return api.post<{ token: string; user: User }>('/auth/register', { username, password });
};

export const fetchUsers = () => {
  return api.get<User[]>('/users');
};

export const fetchTasks = () => {
  return api.get<Task[]>('/tasks');
};

export const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'creatorId'>) => {
  return api.post<Task>('/tasks', taskData);
};

export const updateTask = (id: string, taskData: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
  return api.put<Task>(`/tasks/${id}`, taskData);
};

export const deleteTask = (id: string) => {
  return api.delete<void>(`/tasks/${id}`);
};

export const addComment = (taskId: string, content: string, mentions: string[] = []) => {
