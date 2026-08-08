import React from 'react';
import { Layers } from 'lucide-react';
import { apiClient } from '../api/client';
import { CategoryInfo, MediaItem } from '../types';
import { booksModule } from './books/booksModule';
import { moviesModule } from './movies/moviesModule';
import { tvshowsModule } from './tvshows/tvshowsModule';
import { BaseMediaRecord, CardDetailsProps, CategoryModule, FormFieldsProps } from './types';

const modulesRegistry = new Map<string, CategoryModule<any>>();

/**
 * Register a category plugin module into the application.
 */
export function registerCategoryModule<T extends BaseMediaRecord>(module: CategoryModule<T>) {
  modulesRegistry.set(module.id.toLowerCase(), module);
}

// Pre-register core category modules
registerCategoryModule(moviesModule);
registerCategoryModule(tvshowsModule);
registerCategoryModule(booksModule);
// Map backend variant name 'tv_shows' to tvshows
modulesRegistry.set('tv_shows', tvshowsModule);

/**
 * Create a generic fallback module for unknown or dynamically added categories.
 */
export function createGenericCategoryModule(category: string, info?: Partial<CategoryInfo>): CategoryModule<MediaItem> {
  const displayName = info?.display_name || category.charAt(0).toUpperCase() + category.slice(1);
  const singularName = displayName.endsWith('s') ? displayName.slice(0, -1) : displayName;
  const endpoint = info?.endpoint || `/api/v1/${category}`;

  const GenericFormFields: React.FC<FormFieldsProps> = () => null;
  const GenericCardDetails: React.FC<CardDetailsProps> = () => null;

  return {
    id: category.toLowerCase(),
    displayName,
    singularName,
    description: info?.description || `Track your custom ${displayName} collection`,
    endpoint,
    icon: Layers,
    color: {
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      button: 'bg-cyan-600 shadow-cyan-600/30 hover:bg-cyan-500',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      iconText: 'text-cyan-400',
      borderHover: 'hover:border-cyan-500/40',
      shadow: 'shadow-cyan-600/30',
      accentText: 'text-cyan-300',
    },
    statuses: [
      { value: 'watching', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'plan_to_watch', label: 'Planned' },
      { value: 'dropped', label: 'Dropped' },
      { value: 'on_hold', label: 'On Hold' },
    ],
    defaultStatus: 'watching',
    api: {
      getAll: async () => {
        const res = await apiClient.get<MediaItem[]>(endpoint);
        return res.data.map((item) => ({ ...item, categoryType: category }));
      },
      getById: async (id: number) => {
        const res = await apiClient.get<MediaItem>(`${endpoint}/${id}`);
        return res.data;
      },
      create: async (data: Partial<MediaItem>) => {
        const res = await apiClient.post<MediaItem>(endpoint, data);
        return res.data;
      },
      update: async (id: number, data: Partial<MediaItem>) => {
        const res = await apiClient.put<MediaItem>(`${endpoint}/${id}`, data);
        return res.data;
      },
      delete: async (id: number) => {
        await apiClient.delete(`${endpoint}/${id}`);
      },
    },
    getDefaultFormState: () => ({}),
    FormFields: GenericFormFields,
    CardDetails: GenericCardDetails,
    getStatsSummary: () => ({ total: 0, avgRating: 0 }),
  };
}

/**
 * Retrieve a registered Category Module by category ID.
 * Returns a generic fallback module if not explicitly registered.
 */
export function getCategoryModule(categoryId: string, info?: Partial<CategoryInfo>): CategoryModule<any> {
  const normalized = categoryId.toLowerCase();
  if (modulesRegistry.has(normalized)) {
    return modulesRegistry.get(normalized)!;
  }
  return createGenericCategoryModule(categoryId, info);
}

/**
 * Get all registered category modules.
 */
export function getAllCategoryModules(): CategoryModule<any>[] {
  // Return unique modules (avoiding duplicates like tv_shows mapping)
  const unique = new Set<CategoryModule<any>>();
  modulesRegistry.forEach((mod) => unique.add(mod));
  return Array.from(unique);
}
