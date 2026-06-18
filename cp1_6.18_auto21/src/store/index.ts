import { create } from 'zustand';
import type { User, Task, Comment, Review, Stats } from '@/types';
import { authApi, taskApi, reviewApi, statsApi } from '@/api';

interface AppState {
  currentUser: User | null;
  token: string | null;
  users: User[];
  tasks: Task[];
  comments: Comment[];
  reviews: Review[];
  stats: Stats | null;
  loading: boolean;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUsers: () => Promise<void>;

  fetchTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  fetchComments: (taskId: string) => Promise<void>;
  addComment: (taskId: string, content: string, mentions: string[]) => Promise<void>;

  createReview: (taskId: string, files: { name: string; content: string }[]) => Promise<void>;
  getReview: (id: string) => Promise<Review>;
  addReviewComment: (reviewId: string, data: { fileIndex: number; lineNumber: number; content: string; status: 'approved' | 'changes-requested' }) => Promise<void>;
  updateReviewStatus: (reviewId: string, status: 'pending' | 'approved' | 'changes-requested') => Promise<void>;

  fetchStats: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  token: localStorage.getItem('token'),
  users: [],
  tasks: [],
  comments: [],
  reviews: [],
  stats: null,
  loading: false,

  login: async (username, password) => {
    set({ loading: true });
    try {
      const { data } = await authApi.login({ username, password });
      localStorage.setItem('token', data.token);
      set({ currentUser: data.user, token: data.token, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (username, password) => {
    set({ loading: true });
    try {
      const { data } = await authApi.register({ username, password });
      localStorage.setItem('token', data.token);
      set({ currentUser: data.user, token: data.token, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      currentUser: null,
      token: null,
      users: [],
      tasks: [],
      comments: [],
      reviews: [],
      stats: null,
    });
  },

  fetchUsers: async () => {
    const { data } = await authApi.getUsers();
    set({ users: data });
  },

  fetchTasks: async () => {
    const { data } = await taskApi.fetchTasks();
    set({ tasks: data });
  },

  createTask: async (task) => {
    const { data } = await taskApi.createTask(task);
    set((state) => ({ tasks: [...state.tasks, data] }));
  },

  updateTask: async (id, task) => {
    const { data } = await taskApi.updateTask(id, task);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? data : t)),
    }));
  },

  deleteTask: async (id) => {
    await taskApi.deleteTask(id);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },

  fetchComments: async (taskId) => {
    const { data } = await taskApi.fetchComments(taskId);
    set((state) => {
      const other = state.comments.filter((c) => c.taskId !== taskId);
      return { comments: [...other, ...data] };
    });
  },

  addComment: async (taskId, content, mentions) => {
    const { data } = await taskApi.addComment(taskId, { content, mentions });
    set((state) => ({ comments: [...state.comments, data] }));
  },

  createReview: async (taskId, files) => {
    const { data } = await reviewApi.createReview({ taskId, files });
    set((state) => ({ reviews: [...state.reviews, data] }));
  },

  getReview: async (id) => {
    const { data } = await reviewApi.getReview(id);
    set((state) => ({
      reviews: state.reviews.some((r) => r.id === id)
        ? state.reviews.map((r) => (r.id === id ? data : r))
        : [...state.reviews, data],
    }));
    return data;
  },

  addReviewComment: async (reviewId, commentData) => {
    await reviewApi.addComment(reviewId, commentData);
  },

  updateReviewStatus: async (reviewId, status) => {
    await reviewApi.updateStatus(reviewId, { status });
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === reviewId ? { ...r, status } : r
      ),
    }));
  },

  fetchStats: async () => {
    const { data } = await statsApi.getStats();
    set({ stats: data });
  },
}));
