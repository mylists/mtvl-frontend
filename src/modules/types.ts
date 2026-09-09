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
  id: string;
  title: string;
  status: MediaStatus;
  rating: number;
  notes?: string;
  categoryType?: string;
  onList?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryModuleApi<T = MediaItem> {
  /** Read the shared catalog. This endpoint is public. */
  getCatalog: () => Promise<T[]>;
  /** Read one shared catalog item. This endpoint is public. */
  getCatalogById: (id: string) => Promise<T>;
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

export interface CategoryModule<T extends BaseMediaRecord = MediaItem> {
  id: string; // e.g. 'movies', 'tvshows', 'books'
  displayName: string;
  singularName: string;
  description: string;
  endpoint: string;
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

export function statsForCategory(
  stats: StatsOverview | null,
  key: string,
): { total: number; avgRating: number } {
  const category = stats?.categories?.[key];
  return {
    total: category?.total || 0,
    avgRating: category?.average_rating || 0,
  };
}
