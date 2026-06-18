import { create } from 'zustand';
import type { User } from '@/types';
import * as api from '@/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const getInitialUser = (): User | null => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!getInitialUser() && !!localStorage.getItem('token'),

  login: async (username, password) => {
    const result = await api.login(username, password);
    localStorage.setItem('user', JSON.stringify(result.user));
    localStorage.setItem('token', result.token);
    set({ user: result.user, token: result.token, isAuthenticated: true });
  },

