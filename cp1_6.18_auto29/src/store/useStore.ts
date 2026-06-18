import { create } from 'zustand';
import type { User, Notification } from '@/types';

interface AppState {
  user: User | null;
  notifications: Notification[];
  isLoggedIn: boolean;
  
  setUser: (user: User | null) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  logout: () => void;
  login: (user: User) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  notifications: [],
  isLoggedIn: false,
  
  setUser: (user) => set({ user }),
  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  
  login: (user) => set({ user, isLoggedIn: true }),
  
  logout: () => set({ user: null, notifications: [], isLoggedIn: false }),
}));
