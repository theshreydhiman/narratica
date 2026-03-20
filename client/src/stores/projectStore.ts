import { create } from 'zustand';
import api from '../lib/api';

interface Project {
  id: number;
  title: string;
  description?: string;
  format: string;
  genre: string;
  status: string;
  targetWordCount?: number;
  currentWordCount: number;
  createdAt: string;
  updatedAt: string;
  chapters?: Chapter[];
  storyBible?: any;
  outline?: any;
}

interface Chapter {
  id: number;
  projectId: number;
  title: string;
  order: number;
  content: string;
  wordCount: number;
  status: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  currentChapter: Chapter | null;
  loading: boolean;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: number) => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: number, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  fetchChapter: (id: number) => Promise<void>;
  createChapter: (data: { projectId: number; title: string; order: number }) => Promise<Chapter>;
  updateChapter: (id: number, data: Partial<Chapter>) => Promise<void>;
  deleteChapter: (id: number) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  currentChapter: null,
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/projects');
      set({ projects: res.data.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchProject: async (id) => {
    set({ loading: true });
    try {
      const res = await api.get(`/projects/${id}`);
      set({ currentProject: res.data.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createProject: async (data) => {
    const res = await api.post('/projects', data);
    const project = res.data.data;
    set((state) => ({ projects: [project, ...state.projects] }));
    return project;
  },

  updateProject: async (id, data) => {
    const res = await api.put(`/projects/${id}`, data);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? res.data.data : p)),
      currentProject: state.currentProject?.id === id ? res.data.data : state.currentProject,
    }));
  },

  deleteProject: async (id) => {
    await api.delete(`/projects/${id}`);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
  },

  fetchChapter: async (id) => {
    const res = await api.get(`/chapters/${id}`);
    set({ currentChapter: res.data.data });
  },

  createChapter: async (data) => {
    const res = await api.post('/chapters', data);
    return res.data.data;
  },

  updateChapter: async (id, data) => {
    const res = await api.put(`/chapters/${id}`, data);
    set({ currentChapter: res.data.data });
  },

  deleteChapter: async (id) => {
    await api.delete(`/chapters/${id}`);
    set((state) => ({
      currentChapter: state.currentChapter?.id === id ? null : state.currentChapter,
    }));
  },
}));
