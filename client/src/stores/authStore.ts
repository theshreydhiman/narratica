import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
  skillLevel: string;
  onboardingComplete: boolean;
  streakCount: number;
  totalWords: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; skillLevel: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  checkAuth: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      set({ user: res.data.data.user, error: null });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed';
      set({ error: msg });
      throw new Error(msg);
    }
  },

  register: async (data) => {
    set({ error: null });
    try {
      const res = await api.post('/auth/register', data);
      set({ user: res.data.data.user, error: null });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed';
      set({ error: msg });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ user: null });
    }
  },

  updateUser: (data) => {
    set((state) => ({ user: state.user ? { ...state.user, ...data } : null }));
  },
}));
