/// <reference types="vite/client" />
import axios, { AxiosError } from 'axios';
import {
  APIToken,
  AuthResponse,
  Book,
  BookListItem,
  BulkDeleteResult,
  BulkStatusResult,
  CategoryInfo,
  ExportData,
  ImportBookRecord,
  ImportMovieRecord,
  ImportPayload,
  ImportResult,
  ImportTVShowRecord,
  ListQueryParams,
  Movie,
  MovieListItem,
  Paginated,
  SearchResults,
  StatsOverview,
  TVShow,
  TVShowListItem,
  User,
} from '../types';

function resolveApiBaseUrl(): string {
  const runtime = typeof window !== 'undefined' ? window.__API_BASE_URL__?.trim() : undefined;
  if (runtime) {
    return runtime.replace(/\/$/, '');
  }
  return (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');
}

const API_BASE_URL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mtvl_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function isNotFoundError(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 404;
}

export function isConflictError(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 409;
}

function toQuery(params?: ListQueryParams): Record<string, string> | undefined {
  if (!params) return undefined;
  const query: Record<string, string> = {};
  if (params.q) query.q = params.q;
  if (params.status) query.status = params.status;
  if (params.sort_by) query.sort_by = params.sort_by;
  if (params.order) query.order = params.order;
  if (params.page != null) query.page = String(params.page);
  if (params.limit != null) query.limit = String(params.limit);
  return Object.keys(query).length ? query : undefined;
}

function unwrapCollection<T>(data: T[] | Paginated<T>): T[] {
  if (Array.isArray(data)) return data;
  return data?.data ?? [];
}

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

  listTokens: async (): Promise<APIToken[]> => {
    const res = await apiClient.get<APIToken[]>('/api/v1/auth/tokens');
    return res.data ?? [];
  },

  createToken: async (name: string): Promise<APIToken> => {
    const res = await apiClient.post<APIToken>('/api/v1/auth/tokens', { name });
    return res.data;
  },

  revokeToken: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/api/v1/auth/tokens/${id}`);
    return res.data;
  },
};

export const tokensApi = {
  list: authApi.listTokens,
  create: authApi.createToken,
  revoke: authApi.revokeToken,
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
  getAll: async (params?: ListQueryParams): Promise<Movie[]> => {
    const res = await apiClient.get<Movie[] | Paginated<Movie>>('/api/v1/movies', { params: toQuery(params) });
    return unwrapCollection(res.data);
  },

  getById: async (id: string): Promise<Movie> => {
    const res = await apiClient.get<Movie>(`/api/v1/movies/${id}`);
    return res.data;
  },

  create: async (data: Pick<Movie, 'title'> & Partial<Pick<Movie, 'release_year' | 'director'>>): Promise<Movie> => {
    const res = await apiClient.post<Movie>('/api/v1/movies', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Pick<Movie, 'title' | 'release_year' | 'director'>>): Promise<Movie> => {
    const res = await apiClient.put<Movie>(`/api/v1/movies/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/movies/${id}`);
  },

  bulkDelete: async (ids: string[]): Promise<BulkDeleteResult> => {
    const res = await apiClient.post<BulkDeleteResult>('/api/v1/movies/bulk-delete', { ids });
    return res.data;
  },

  getList: async (params?: ListQueryParams): Promise<MovieListItem[]> => {
    const res = await apiClient.get<MovieListItem[] | Paginated<MovieListItem>>('/api/v1/movies/list', {
      params: toQuery(params),
    });
    return unwrapCollection(res.data);
  },

  getListItem: async (id: string): Promise<MovieListItem> => {
    const res = await apiClient.get<MovieListItem>(`/api/v1/movies/list/${id}`);
    return res.data;
  },

  addToList: async (data: { id: string; status?: string; rating?: number; notes?: string }): Promise<MovieListItem> => {
    const res = await apiClient.post<MovieListItem>('/api/v1/movies/list', data);
    return res.data;
  },

  updateList: async (
    id: string,
    data: { status?: string; rating?: number; notes?: string },
  ): Promise<MovieListItem> => {
    const res = await apiClient.put<MovieListItem>(`/api/v1/movies/list/${id}`, data);
    return res.data;
  },

  removeFromList: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/movies/list/${id}`);
  },

  bulkRemoveFromList: async (ids: string[]): Promise<BulkDeleteResult> => {
    const res = await apiClient.post<BulkDeleteResult>('/api/v1/movies/list/bulk-delete', { ids });
    return res.data;
  },

  bulkStatus: async (ids: string[], status: string): Promise<BulkStatusResult> => {
    const res = await apiClient.post<BulkStatusResult>('/api/v1/movies/list/bulk-status', { ids, status });
    return res.data;
  },
};

// TV Shows Module API
export const tvshowsApi = {
  getAll: async (params?: ListQueryParams): Promise<TVShow[]> => {
    const res = await apiClient.get<TVShow[] | Paginated<TVShow>>('/api/v1/tvshows', { params: toQuery(params) });
    return unwrapCollection(res.data);
  },

  getById: async (id: string): Promise<TVShow> => {
    const res = await apiClient.get<TVShow>(`/api/v1/tvshows/${id}`);
    return res.data;
  },

  create: async (data: Pick<TVShow, 'title'> & Partial<Pick<TVShow, 'total_episodes'>>): Promise<TVShow> => {
    const res = await apiClient.post<TVShow>('/api/v1/tvshows', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Pick<TVShow, 'title' | 'total_episodes'>>): Promise<TVShow> => {
    const res = await apiClient.put<TVShow>(`/api/v1/tvshows/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/tvshows/${id}`);
  },

  bulkDelete: async (ids: string[]): Promise<BulkDeleteResult> => {
    const res = await apiClient.post<BulkDeleteResult>('/api/v1/tvshows/bulk-delete', { ids });
    return res.data;
  },

  getList: async (params?: ListQueryParams): Promise<TVShowListItem[]> => {
    const res = await apiClient.get<TVShowListItem[] | Paginated<TVShowListItem>>('/api/v1/tvshows/list', {
      params: toQuery(params),
    });
    return unwrapCollection(res.data);
  },

  getListItem: async (id: string): Promise<TVShowListItem> => {
    const res = await apiClient.get<TVShowListItem>(`/api/v1/tvshows/list/${id}`);
    return res.data;
  },

  addToList: async (data: {
    id: string;
    current_season?: number;
    current_episode?: number;
    status?: string;
    rating?: number;
    notes?: string;
  }): Promise<TVShowListItem> => {
    const res = await apiClient.post<TVShowListItem>('/api/v1/tvshows/list', data);
    return res.data;
  },

  updateList: async (
    id: string,
    data: {
      current_season?: number;
      current_episode?: number;
      status?: string;
      rating?: number;
      notes?: string;
    },
  ): Promise<TVShowListItem> => {
    const res = await apiClient.put<TVShowListItem>(`/api/v1/tvshows/list/${id}`, data);
    return res.data;
  },

  removeFromList: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/tvshows/list/${id}`);
  },

  bulkRemoveFromList: async (ids: string[]): Promise<BulkDeleteResult> => {
    const res = await apiClient.post<BulkDeleteResult>('/api/v1/tvshows/list/bulk-delete', { ids });
    return res.data;
  },

  bulkStatus: async (ids: string[], status: string): Promise<BulkStatusResult> => {
    const res = await apiClient.post<BulkStatusResult>('/api/v1/tvshows/list/bulk-status', { ids, status });
    return res.data;
  },
};

// Books Module API
export const booksApi = {
  getAll: async (params?: ListQueryParams): Promise<Book[]> => {
    const res = await apiClient.get<Book[] | Paginated<Book>>('/api/v1/books', { params: toQuery(params) });
    return unwrapCollection(res.data);
  },

  getById: async (id: string): Promise<Book> => {
    const res = await apiClient.get<Book>(`/api/v1/books/${id}`);
    return res.data;
  },

  create: async (data: Pick<Book, 'title'>): Promise<Book> => {
    const res = await apiClient.post<Book>('/api/v1/books', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Pick<Book, 'title'>>): Promise<Book> => {
    const res = await apiClient.put<Book>(`/api/v1/books/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/books/${id}`);
  },

  bulkDelete: async (ids: string[]): Promise<BulkDeleteResult> => {
    const res = await apiClient.post<BulkDeleteResult>('/api/v1/books/bulk-delete', { ids });
    return res.data;
  },

  getList: async (params?: ListQueryParams): Promise<BookListItem[]> => {
    const res = await apiClient.get<BookListItem[] | Paginated<BookListItem>>('/api/v1/books/list', {
      params: toQuery(params),
    });
    return unwrapCollection(res.data);
  },

  getListItem: async (id: string): Promise<BookListItem> => {
    const res = await apiClient.get<BookListItem>(`/api/v1/books/list/${id}`);
    return res.data;
  },

  addToList: async (data: { id: string; status?: string; rating?: number; notes?: string }): Promise<BookListItem> => {
    const res = await apiClient.post<BookListItem>('/api/v1/books/list', data);
    return res.data;
  },

  updateList: async (
    id: string,
    data: { status?: string; rating?: number; notes?: string },
  ): Promise<BookListItem> => {
    const res = await apiClient.put<BookListItem>(`/api/v1/books/list/${id}`, data);
    return res.data;
  },

  removeFromList: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/books/list/${id}`);
  },

  bulkRemoveFromList: async (ids: string[]): Promise<BulkDeleteResult> => {
    const res = await apiClient.post<BulkDeleteResult>('/api/v1/books/list/bulk-delete', { ids });
    return res.data;
  },

  bulkStatus: async (ids: string[], status: string): Promise<BulkStatusResult> => {
    const res = await apiClient.post<BulkStatusResult>('/api/v1/books/list/bulk-status', { ids, status });
    return res.data;
  },
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function notNull<T>(value: T | null): value is T {
  return value !== null;
}

/**
 * Accepts a fresh export, a previous export shape, or a raw import payload
 * and converts it into the backend's `{ overwrite, data }` contract.
 */
export function toImportPayload(parsed: unknown, overwrite: boolean): ImportPayload {
  const root = asRecord(parsed) ?? {};
  const nested = asRecord(root.data);
  const lists = asRecord(root.lists);

  const catalogMovies = asArray<Movie & ImportMovieRecord>(nested?.movies ?? root.movies);
  const catalogShows = asArray<TVShow & ImportTVShowRecord>(nested?.tv_shows ?? root.tv_shows);
  const catalogBooks = asArray<Book & ImportBookRecord>(nested?.books ?? root.books);

  const movieLinks = asArray<{ movie_id: string; status?: string; rating?: number; notes?: string }>(lists?.movies);
  const showLinks = asArray<{
    tv_show_id: string;
    current_season?: number;
    current_episode?: number;
    status?: string;
    rating?: number;
    notes?: string;
  }>(lists?.tv_shows);
  const bookLinks = asArray<{ book_id: string; status?: string; rating?: number; notes?: string }>(lists?.books);

  const movieById = new Map(catalogMovies.filter((m) => m.id).map((m) => [m.id, m]));
  const showById = new Map(catalogShows.filter((s) => s.id).map((s) => [s.id, s]));
  const bookById = new Map(catalogBooks.filter((b) => b.id).map((b) => [b.id, b]));

  const moviesFromLists = movieLinks
    .map((link): ImportMovieRecord | null => {
      const catalog = movieById.get(link.movie_id);
      if (!catalog?.title) return null;
      return {
        title: catalog.title,
        release_year: catalog.release_year,
        director: catalog.director,
        status: link.status,
        rating: link.rating,
        notes: link.notes,
      };
    })
    .filter(notNull);

  const showsFromLists = showLinks
    .map((link): ImportTVShowRecord | null => {
      const catalog = showById.get(link.tv_show_id);
      if (!catalog?.title) return null;
      return {
        title: catalog.title,
        total_episodes: catalog.total_episodes,
        current_season: link.current_season,
        current_episode: link.current_episode,
        status: link.status,
        rating: link.rating,
        notes: link.notes,
      };
    })
    .filter(notNull);

  const booksFromLists = bookLinks
    .map((link): ImportBookRecord | null => {
      const catalog = bookById.get(link.book_id);
      if (!catalog?.title) return null;
      return {
        title: catalog.title,
        status: link.status,
        rating: link.rating,
        notes: link.notes,
      };
    })
    .filter(notNull);

  return {
    overwrite,
    data: {
      movies: moviesFromLists.length > 0 ? moviesFromLists : catalogMovies,
      tv_shows: showsFromLists.length > 0 ? showsFromLists : catalogShows,
      books: booksFromLists.length > 0 ? booksFromLists : catalogBooks,
    },
  };
}

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

  importData: async (payload: ImportPayload): Promise<ImportResult> => {
    const res = await apiClient.post<ImportResult>('/api/v1/import', payload);
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

export type { AxiosError };
