import axios from 'axios';
import type { Course, Feedback, Stats, StudentHighlight } from './types';

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

export const courseApi = {
  getAll: () => api.get<Course[]>('/courses').then((res) => res.data),
};

export const feedbackApi = {
  getByCourseId: (courseId: string) =>
    api.get<Feedback>(`/feedback/${courseId}`).then((res) => res.data),
  submit: (data: {
    courseId: string;
    rating: number;
    summary: string;
    highlights: StudentHighlight[];
  }) =>
    api.post<{ id: string; feedback: Feedback }>('/feedback', data).then((res) => res.data),
};

export const statsApi = {
  get: () => api.get<Stats>('/stats').then((res) => res.data),
};
