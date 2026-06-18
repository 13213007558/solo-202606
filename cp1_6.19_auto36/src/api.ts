import axios from 'axios';
import { Project, LogEntry } from './types';

const api = axios.create({
  baseURL: '/api',
});

export const projectApi = {
  getAll: (): Promise<Project[]> => api.get('/projects').then((r) => r.data),
  getById: (id: string): Promise<Project> => api.get(`/projects/${id}`).then((r) => r.data),
  create: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> =>
    api.post('/projects', data).then((r) => r.data),
  update: (id: string, data: Partial<Project>): Promise<Project> =>
    api.put(`/projects/${id}`, data).then((r) => r.data),
  remove: (id: string): Promise<void> => api.delete(`/projects/${id}`),
};

export const logApi = {
  getByProject: (projectId: string): Promise<LogEntry[]> =>
    api.get(`/logs/${projectId}`).then((r) => r.data),
  getRecent: (limit = 5): Promise<LogEntry[]> =>
    api.get('/logs', { params: { limit } }).then((r) => r.data),
  create: (
    projectId: string,
    data: Omit<LogEntry, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>
  ): Promise<LogEntry> => api.post(`/logs/${projectId}`, data).then((r) => r.data),
  update: (id: string, data: Partial<LogEntry>): Promise<LogEntry> =>
    api.put(`/logs/${id}`, data).then((r) => r.data),
  remove: (id: string): Promise<void> => api.delete(`/logs/${id}`),
};
