/// <reference types="vite/client" />
import axios from 'axios';
import {
  AuthResponse,
  Book,
  CategoryInfo,
  ExportData,
  ImportPayload,
  Movie,
  SearchResults,
  StatsOverview,
  TVShow,
  User,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mtvl_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Services
export const authApi = {
  register: async (username: string, email: string, password: string): Promise<User> => {
    const res = await apiClient.post<User>('/api/v1/auth/register', { username, email, password });
    return res.data;
  },

  login: async (usernameOrEmail: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/api/v1/auth/login', {
      username_or_email: usernameOrEmail,
      password,
    });
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/api/v1/auth/me');
    return res.data;
  },

  updateMe: async (username: string, email: string): Promise<User> => {
    const res = await apiClient.put<User>('/api/v1/auth/me', { username, email });
    return res.data;
  },

  updatePassword: async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    const res = await apiClient.put<{ message: string }>('/api/v1/auth/password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return res.data;
  },

  deleteMe: async (): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>('/api/v1/auth/me');
    return res.data;
  },
};

// Categories Discovery API
export const categoriesApi = {
  getCategories: async (): Promise<CategoryInfo[]> => {
    const res = await apiClient.get<CategoryInfo[]>('/api/v1/categories');
    return res.data;
  },
};

// Movies Module API
export const moviesApi = {
  getAll: async (): Promise<Movie[]> => {
    const res = await apiClient.get<Movie[]>('/api/v1/movies');
    return res.data;
  },

  getById: async (id: number): Promise<Movie> => {
    const res = await apiClient.get<Movie>(`/api/v1/movies/${id}`);
    return res.data;
  },

  create: async (data: Partial<Movie>): Promise<Movie> => {
    const res = await apiClient.post<Movie>('/api/v1/movies', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Movie>): Promise<Movie> => {
    const res = await apiClient.put<Movie>(`/api/v1/movies/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/movies/${id}`);
  },
};

// TV Shows Module API
export const tvshowsApi = {
  getAll: async (): Promise<TVShow[]> => {
    const res = await apiClient.get<TVShow[]>('/api/v1/tvshows');
    return res.data;
  },

  getById: async (id: number): Promise<TVShow> => {
    const res = await apiClient.get<TVShow>(`/api/v1/tvshows/${id}`);
    return res.data;
  },

  create: async (data: Partial<TVShow>): Promise<TVShow> => {
    const res = await apiClient.post<TVShow>('/api/v1/tvshows', data);
    return res.data;
  },

  update: async (id: number, data: Partial<TVShow>): Promise<TVShow> => {
    const res = await apiClient.put<TVShow>(`/api/v1/tvshows/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/tvshows/${id}`);
  },
};

// Books Module API
export const booksApi = {
  getAll: async (): Promise<Book[]> => {
    const res = await apiClient.get<Book[]>('/api/v1/books');
    return res.data;
  },

  getById: async (id: number): Promise<Book> => {
    const res = await apiClient.get<Book>(`/api/v1/books/${id}`);
    return res.data;
  },

  create: async (data: Partial<Book>): Promise<Book> => {
    const res = await apiClient.post<Book>('/api/v1/books', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Book>): Promise<Book> => {
    const res = await apiClient.put<Book>(`/api/v1/books/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/books/${id}`);
  },
};

// Additional Backend Services (Stats, Global Search, Export/Import, Health)
export const servicesApi = {
  getStats: async (): Promise<StatsOverview> => {
    const res = await apiClient.get<StatsOverview>('/api/v1/stats');
    return res.data;
  },

  search: async (query: string): Promise<SearchResults> => {
    const res = await apiClient.get<SearchResults>(`/api/v1/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },

  exportData: async (): Promise<ExportData> => {
    const res = await apiClient.get<ExportData>('/api/v1/export');
    return res.data;
  },

  importData: async (payload: ImportPayload): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/api/v1/import', payload);
    return res.data;
  },

  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await apiClient.get('/health', { timeout: 3000 });
      return res.status === 200 && res.data?.status === 'up';
    } catch {
      return false;
    }
  },
};
