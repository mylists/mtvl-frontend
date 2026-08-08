import React from 'react';
import { MediaItem, MediaStatus, StatsOverview } from '../types';

export interface CategoryModuleColor {
  badge: string;
  button: string;
  iconBg: string;
  iconText: string;
  borderHover: string;
  shadow: string;
  accentText: string;
}

export interface FormFieldsProps<T = any> {
  formData: T;
  onChange: (updates: Partial<T>) => void;
}

export interface CardDetailsProps<T = any> {
  item: T;
  onUpdateProgress?: (item: T, increment: number) => void;
}

export interface BaseMediaRecord {
  id: number;
  title: string;
  status: MediaStatus;
  rating: number;
  notes?: string;
  categoryType?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryModuleApi<T = MediaItem> {
  getAll: () => Promise<T[]>;
  getById: (id: number) => Promise<T>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: number, data: Partial<T>) => Promise<T>;
  delete: (id: number) => Promise<void>;
}

export interface CategoryModule<T extends BaseMediaRecord = MediaItem> {
  id: string; // e.g. 'movies', 'tvshows', 'books'
  displayName: string; // e.g. 'Movies', 'TV Shows', 'Books'
  singularName: string; // e.g. 'Movie', 'TV Show', 'Book'
  description: string;
  endpoint: string; // e.g. '/api/v1/movies'
  icon: React.ComponentType<{ className?: string }>;
  color: CategoryModuleColor;

  statuses: Array<{ value: MediaStatus; label: string }>;
  defaultStatus: MediaStatus;

  api: CategoryModuleApi<T>;

  getDefaultFormState: () => Record<string, any>;
  FormFields: React.FC<FormFieldsProps>;
  CardDetails: React.FC<CardDetailsProps>;

  updateProgress?: (item: T, increment: number, api: CategoryModuleApi<T>) => Promise<void>;
  getStatsSummary?: (stats: StatsOverview | null) => { total: number; avgRating: number };
}
