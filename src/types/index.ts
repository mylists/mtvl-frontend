export type MediaStatus = 'watching' | 'reading' | 'completed' | 'plan_to_watch' | 'plan_to_read' | 'dropped' | 'on_hold';

export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CategoryInfo {
  category: string;      // e.g. "movies", "tvshows", "books"
  display_name: string;  // e.g. "Movies", "TV Shows", "Books"
  description: string;
  endpoint: string;     // e.g. "/api/v1/movies"
}

export interface Movie {
  id: number;
  user_id: number;
  title: string;
  release_year?: number;
  director?: string;
  status: MediaStatus;
  rating: number; // 0-5
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TVShow {
  id: number;
  user_id: number;
  title: string;
  current_season?: number;
  current_episode?: number;
  total_episodes?: number;
  status: MediaStatus;
  rating: number; // 0-5
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Book {
  id: number;
  user_id: number;
  title: string;
  author?: string;
  pages_read?: number;
  total_pages?: number;
  status: MediaStatus;
  rating: number; // 0-5
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type MediaItem = (Movie | TVShow | Book) & {
  categoryType: 'movies' | 'tvshows' | 'books' | string;
};

export interface StatsOverview {
  movies: {
    total: number;
    avg_rating: number;
    by_status: Record<string, number>;
  };
  tv_shows: {
    total: number;
    avg_rating: number;
    by_status: Record<string, number>;
  };
  books: {
    total: number;
    avg_rating: number;
    by_status: Record<string, number>;
  };
}

export interface SearchResults {
  movies: Movie[];
  tv_shows: TVShow[];
  books: Book[];
}

export interface ExportData {
  version: string;
  exported_at: string;
  movies: Movie[];
  tv_shows: TVShow[];
  books: Book[];
}

export interface ImportPayload {
  mode: 'replace' | 'merge';
  movies?: Partial<Movie>[];
  tv_shows?: Partial<TVShow>[];
  books?: Partial<Book>[];
}
