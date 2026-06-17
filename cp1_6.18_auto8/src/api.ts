import axios from 'axios';
import { Recipe, Comment, CommentsResponse, User } from './types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/login', data),
};

export const recipeApi = {
  getAll: () => api.get<Recipe[]>('/recipes'),

  getById: (id: string) => api.get<Recipe>(`/recipes/${id}`),

  create: (data: {
    title: string;
    coverUrl: string;
    ingredients: { name: string; amount: string }[];
    steps: { title: string; description: string; imageUrl?: string }[];
    totalTime: number;
  }) => api.post<Recipe>('/recipes', data),

  like: (id: string) =>
    api.post<{ likes: number; liked: boolean }>(`/recipes/${id}/like`),
};

export const commentApi = {
  getByRecipeId: (recipeId: string, page: number = 1) =>
    api.get<CommentsResponse>(`/recipes/${recipeId}/comments`, {
      params: { page },
    }),

  create: (
    recipeId: string,
    data: {
      content: string;
      parentId?: string | null;
      replyToId?: string;
      replyToUsername?: string;
    }
  ) => api.post<Comment>(`/recipes/${recipeId}/comments`, data),

  delete: (id: string) => api.delete(`/comments/${id}`),
};

export default api;
