export type MediaStatus =
  | 'watching'
  | 'reading'
  | 'completed'
  | 'plan_to_watch'
  | 'plan_to_read'
  | 'dropped'
  | 'on_hold';

export interface User {
  /** UUID supplied by the backend. */
  id: string;
  username: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface APIToken {
  id: string;
  user_id: string;
  token: string;
  name: string;
  created_at: string;
  last_used_at?: string | null;
}

export interface CreateAPITokenPayload {
  name: string;
}

export interface CategoryInfo {
  category: string; // e.g. "movies", "tv_shows", "books"
  display_name: string;
  description: string;
  endpoint: string; // e.g. "/api/v1/movies"
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface ListQueryParams {
  q?: string;
  status?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/** Shared catalog movie (no per-user fields). */
export interface Movie {
  id: string;
  title: string;
  release_year?: number;
  director?: string;
  created_at?: string;
  updated_at?: string;
}

/** Shared catalog TV show (no per-user fields). */
export interface TVShow {
  id: string;
  title: string;
  total_episodes?: number;
  created_at?: string;
  updated_at?: string;
}

/** Shared catalog book (no per-user fields). */
export interface Book {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export type CatalogItem = Movie | TVShow | Book;

export interface MovieListItem extends Movie {
  status: MediaStatus;
  rating: number;
  notes?: string;
}

export interface TVShowListItem extends TVShow {
  current_season?: number;
  current_episode?: number;
  status: MediaStatus;
  rating: number;
  notes?: string;
}

export interface BookListItem extends Book {
  status: MediaStatus;
  rating: number;
  notes?: string;
}

export type ListItem = MovieListItem | TVShowListItem | BookListItem;

export type MediaItem = {
  id: string;
  title: string;
  categoryType: 'movies' | 'tvshows' | 'books' | string;
  /** False when the record is a catalog item that is not on the current user's list. */
  onList?: boolean;
  created_at?: string;
  updated_at?: string;
  // User list specific fields
  status?: MediaStatus;
  rating?: number;
  notes?: string;
  current_season?: number;
  current_episode?: number;
  // Catalog specific fields
  release_year?: number;
  director?: string;
  total_episodes?: number;
  [key: string]: any;
};

export interface UserMovieLink {
  user_id: string;
  movie_id: string;
  status: string;
  rating: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserTVShowLink {
  user_id: string;
  tv_show_id: string;
  current_season?: number;
  current_episode?: number;
  status: string;
  rating: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserBookLink {
  user_id: string;
  book_id: string;
  status: string;
  rating: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryStats {
  total: number;
  average_rating: number;
  status_breakdown: Record<string, number>;
}

export interface StatsOverview {
  total_items: number;
  categories: {
    movies: CategoryStats;
    tv_shows: CategoryStats;
    books: CategoryStats;
    [key: string]: CategoryStats;
  };
}

export interface SearchResults {
  query: string;
  results: {
    movies: Movie[];
    tv_shows: TVShow[];
    books: Book[];
  };
  total_matches: number;
}

export interface ExportData {
  version: string;
  exported_at: string;
  user: User;
  data: {
    movies: Movie[];
    tv_shows: TVShow[];
    books: Book[];
  };
  lists: {
    movies: UserMovieLink[];
    tv_shows: UserTVShowLink[];
    books: UserBookLink[];
  };
}

export interface ImportMovieRecord {
  title: string;
  release_year?: number;
  director?: string;
  status?: string;
  rating?: number;
  notes?: string;
}

export interface ImportTVShowRecord {
  title: string;
  current_season?: number;
  current_episode?: number;
  total_episodes?: number;
  status?: string;
  rating?: number;
  notes?: string;
}

export interface ImportBookRecord {
  title: string;
  status?: string;
  rating?: number;
  notes?: string;
}

export interface ImportPayload {
  overwrite: boolean;
  data: {
    movies?: ImportMovieRecord[];
    tv_shows?: ImportTVShowRecord[];
    books?: ImportBookRecord[];
  };
}

export interface ImportResult {
  message: string;
  imported: {
    movies: number;
    tv_shows: number;
    books: number;
  };
}

export interface BulkDeleteResult {
  message: string;
  deleted_count: number;
}

export interface BulkStatusResult {
  message: string;
  updated_count: number;
}
