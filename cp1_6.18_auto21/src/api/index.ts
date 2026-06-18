import axios from 'axios';
import type { User, Task, Comment, Review, ReviewFile, ReviewLineComment, Stats, AuthResponse, Priority, TaskStatus, ReviewStatus } from '@/types';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/login", { username, password });
  return res.data;
};

export const register = async (username: string, password: string): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/register", { username, password });
  return res.data;
};

export const fetchUsers = async (): Promise<User[]> => {
  const res = await api.get<User[]>("/auth/users");
  return res.data;
};

export const fetchTasks = async (): Promise<Task[]> => {
  const res = await api.get<Task[]>("/tasks");
  return res.data;
};

export const addComment = async (
  taskId: string,
  content: string,
  mentions?: string[]
): Promise<Comment> => {
  const res = await api.post<Comment>("/tasks/" + taskId + "/comments", { content, mentions });
  return res.data;
};

export const submitReview = async (taskId: string, files: ReviewFile[]): Promise<Review> => {
  const res = await api.post<Review>("/reviews", { taskId, files });
  return res.data;
};

export const fetchReview = async (id: string): Promise<Review> => {
  const res = await api.get<Review>("/reviews/" + id);
  return res.data;
};

export const fetchReviews = async (): Promise<Review[]> => {
  const res = await api.get<Review[]>("/reviews");
  return res.data;
};

export const addReviewLineComment = async (
  reviewId: string,
  fileIndex: number,
  lineNumber: number,
  content: string,
  status: "approved" | "changes-requested"
): Promise<ReviewLineComment> => {
  const res = await api.post<ReviewLineComment>("/reviews/" + reviewId + "/comments", {
    fileIndex,
    lineNumber,
    content,
    status,
  });
  return res.data;
};

export const updateReviewStatus = async (
  reviewId: string,
  status: ReviewStatus
): Promise<Review> => {
  const res = await api.put<Review>("/reviews/" + reviewId + "/status", { status });
  return res.data;
};

export const updateReview = async (
  id: string,
  partialData: Partial<Review>
): Promise<Review> => {
  const res = await api.put<Review>("/reviews/" + id, partialData);
  return res.data;
};

export const fetchStats = async (): Promise<Stats> => {
  const res = await api.get<Stats>("/stats");
  return res.data;
};
