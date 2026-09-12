import React from 'react';
import { Film } from 'lucide-react';
import { isNotFoundError, moviesApi } from '../../api/client';
import { Movie, MovieListItem } from '../../types';
import { CardDetailsProps, CategoryModule, FormFieldsProps, statsForCategory } from '../types';

type MovieRecord = Partial<MovieListItem> & Movie & { categoryType?: string; onList?: boolean };

function withMovieMeta(item: Movie | MovieListItem, onList: boolean): MovieRecord {
  return {
    ...item,
    categoryType: 'movies',
    onList,
  };
}

const MovieFormFields: React.FC<FormFieldsProps> = ({ formData, onChange, readOnly }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Release Year</label>
        <input
          type="number"
          value={formData.release_year ?? ''}
          onChange={(e) => onChange({ release_year: e.target.value ? Number(e.target.value) : undefined })}
          readOnly={readOnly}
          className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Director</label>
        <input
          type="text"
          placeholder="Christopher Nolan"
          value={formData.director ?? ''}
          onChange={(e) => onChange({ director: e.target.value })}
          readOnly={readOnly}
          className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
        />
      </div>
    </div>
  );
};

const MovieCardDetails: React.FC<CardDetailsProps> = ({ item }) => {
  const movie = item as Movie;
  return (
    <div className="space-y-1 text-xs text-slate-400">
      {movie.release_year ? (
        <p>
          Year: <strong className="text-slate-200">{movie.release_year}</strong>
        </p>
      ) : null}
      {movie.director ? (
        <p>
          Director: <strong className="text-slate-200">{movie.director}</strong>
        </p>
      ) : null}
    </div>
  );
};

export const moviesModule: CategoryModule<MovieRecord> = {
  id: 'movies',
  displayName: 'Movies',
  singularName: 'Movie',
  description: 'Track feature films, movies & documentaries',
  endpoint: '/api/v1/movies',
  icon: Film,
  color: {
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    button: 'bg-indigo-600 shadow-indigo-600/30 hover:bg-indigo-500',
    iconBg: 'bg-indigo-500/10 border-indigo-500/20',
    iconText: 'text-indigo-400',
    borderHover: 'hover:border-indigo-500/40',
    shadow: 'shadow-indigo-600/30',
    accentText: 'text-indigo-300',
  },
  statuses: [
    { value: 'watching', label: 'Watching' },
    { value: 'completed', label: 'Completed' },
    { value: 'plan_to_watch', label: 'Plan to Watch' },
    { value: 'dropped', label: 'Dropped' },
    { value: 'on_hold', label: 'On Hold' },
  ],
  defaultStatus: 'plan_to_watch',
  api: {
    getCatalog: async (params) => {
      const data = await moviesApi.getAll(params);
      return data.map((m) => withMovieMeta(m, false));
    },
    getCatalogById: async (id) => withMovieMeta(await moviesApi.getById(id), false),
    getAll: async (params) => {
      const data = await moviesApi.getList(params);
      return data.map((m) => withMovieMeta(m, true));
    },
    getById: async (id) => {
      try {
        return withMovieMeta(await moviesApi.getListItem(id), true);
      } catch (err) {
        if (!isNotFoundError(err)) throw err;
        return withMovieMeta(await moviesApi.getById(id), false);
      }
    },
    create: async (data) => {
      const catalog = await moviesApi.create({
        title: data.title ?? '',
        release_year: data.release_year,
        director: data.director,
      });
      const listItem = await moviesApi.addToList({
        id: catalog.id,
        status: data.status,
        rating: data.rating,
        notes: data.notes,
      });
      return withMovieMeta(listItem, true);
    },
    update: async (id, data) => {
      await moviesApi.update(id, {
        title: data.title,
        release_year: data.release_year,
        director: data.director,
      });
      try {
        return withMovieMeta(
          await moviesApi.updateList(id, {
            status: data.status,
            rating: data.rating,
            notes: data.notes,
          }),
          true,
        );
      } catch (err) {
        if (!isNotFoundError(err)) throw err;
        return withMovieMeta(
          await moviesApi.addToList({
            id,
            status: data.status,
            rating: data.rating,
            notes: data.notes,
          }),
          true,
        );
      }
    },
    delete: async (id) => {
      await moviesApi.removeFromList(id);
    },
  },
  getDefaultFormState: () => ({
    release_year: new Date().getFullYear(),
    director: '',
  }),
  FormFields: MovieFormFields,
  CardDetails: MovieCardDetails,
  getStatsSummary: (stats) => statsForCategory(stats, 'movies'),
};
