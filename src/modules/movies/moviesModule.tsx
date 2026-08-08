import React from 'react';
import { Film } from 'lucide-react';
import { moviesApi } from '../../api/client';
import { Movie } from '../../types';
import { CardDetailsProps, CategoryModule, FormFieldsProps } from '../types';

const MovieFormFields: React.FC<FormFieldsProps> = ({ formData, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Release Year</label>
        <input
          type="number"
          value={formData.release_year ?? new Date().getFullYear()}
          onChange={(e) => onChange({ release_year: Number(e.target.value) })}
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
      {movie.release_year && (
        <p>
          Year: <strong className="text-slate-200">{movie.release_year}</strong>
        </p>
      )}
      {movie.director && (
        <p>
          Director: <strong className="text-slate-200">{movie.director}</strong>
        </p>
      )}
    </div>
  );
};

export const moviesModule: CategoryModule<Movie> = {
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
  defaultStatus: 'watching',
  api: {
    getAll: async () => {
      const data = await moviesApi.getAll();
      return data.map((m) => ({ ...m, categoryType: 'movies' }));
    },
    getById: moviesApi.getById,
    create: moviesApi.create,
    update: moviesApi.update,
    delete: moviesApi.delete,
  },
  getDefaultFormState: () => ({
    release_year: new Date().getFullYear(),
    director: '',
  }),
  FormFields: MovieFormFields,
  CardDetails: MovieCardDetails,
  getStatsSummary: (stats) => ({
    total: stats?.movies?.total || 0,
    avgRating: stats?.movies?.avg_rating || 0,
  }),
};
