import React from 'react';
import { Plus, Tv } from 'lucide-react';
import { isNotFoundError, tvshowsApi } from '../../api/client';
import { TVShow, TVShowListItem } from '../../types';
import { CardDetailsProps, CategoryModule, FormFieldsProps, statsForCategory } from '../types';

type TVShowRecord = Partial<TVShowListItem> & TVShow & { categoryType?: string; onList?: boolean };

function withTVMeta(item: TVShow | TVShowListItem, onList: boolean): TVShowRecord {
  return {
    ...item,
    categoryType: 'tvshows',
    onList,
  };
}

const TVShowFormFields: React.FC<FormFieldsProps> = ({ formData, onChange, readOnly }) => {
  if (readOnly) {
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Total Episodes</label>
        <input
          type="number"
          min="0"
          value={formData.total_episodes ?? ''}
          readOnly
          className="w-full glass-input px-3 py-2 rounded-xl text-sm"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Season</label>
        <input
          type="number"
          min="1"
          value={formData.current_season ?? 1}
          onChange={(e) => onChange({ current_season: Number(e.target.value) })}
          className="w-full glass-input px-3 py-2 rounded-xl text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Current Ep</label>
        <input
          type="number"
          min="0"
          value={formData.current_episode ?? 0}
          onChange={(e) => onChange({ current_episode: Number(e.target.value) })}
          className="w-full glass-input px-3 py-2 rounded-xl text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Total Eps</label>
        <input
          type="number"
          min="0"
          value={formData.total_episodes ?? 12}
          onChange={(e) => onChange({ total_episodes: Number(e.target.value) })}
          className="w-full glass-input px-3 py-2 rounded-xl text-sm"
        />
      </div>
    </div>
  );
};

const TVShowCardDetails: React.FC<CardDetailsProps> = ({ item, readOnly, onUpdateProgress }) => {
  const tv = item as TVShowRecord;
  const isCatalog = readOnly || item.onList === false;

  if (isCatalog) {
    if (!tv.total_episodes) return null;
    return (
      <div className="space-y-1 text-xs text-slate-400">
        <p>
          Episodes: <strong className="text-slate-200">{tv.total_episodes}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-800 text-xs text-slate-400">
      <span>
        Season <strong className="text-slate-200">{tv.current_season || 1}</strong> • Ep{' '}
        <strong className="text-slate-200">{tv.current_episode || 0}</strong> / {tv.total_episodes || '∞'}
      </span>

      {onUpdateProgress && (
        <button
          onClick={() => onUpdateProgress(item, 1)}
          className="px-2 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 text-[11px] font-bold transition-all flex items-center space-x-1"
          title="Increment episode (+1)"
        >
          <Plus className="w-3 h-3" />
          <span>Ep</span>
        </button>
      )}
    </div>
  );
};

export const tvshowsModule: CategoryModule<TVShowRecord> = {
  id: 'tvshows',
  displayName: 'TV Shows',
  singularName: 'TV Show',
  description: 'Track TV series, anime & episodic content',
  endpoint: '/api/v1/tvshows',
  icon: Tv,
  color: {
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    button: 'bg-purple-600 shadow-purple-600/30 hover:bg-purple-500',
    iconBg: 'bg-purple-500/10 border-purple-500/20',
    iconText: 'text-purple-400',
    borderHover: 'hover:border-purple-500/40',
    shadow: 'shadow-purple-600/30',
    accentText: 'text-purple-300',
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
    getCatalog: async () => {
      const data = await tvshowsApi.getAll();
      return data.map((t) => withTVMeta(t, false));
    },
    getCatalogById: async (id) => withTVMeta(await tvshowsApi.getById(id), false),
    getAll: async () => {
      const data = await tvshowsApi.getList();
      return data.map((t) => withTVMeta(t, true));
    },
    getById: async (id) => {
      try {
        return withTVMeta(await tvshowsApi.getListItem(id), true);
      } catch (err) {
        if (!isNotFoundError(err)) throw err;
        return withTVMeta(await tvshowsApi.getById(id), false);
      }
    },
    create: async (data) => {
      const catalog = await tvshowsApi.create({
        title: data.title ?? '',
        total_episodes: data.total_episodes,
      });
      const listItem = await tvshowsApi.addToList({
        id: catalog.id,
        current_season: data.current_season,
        current_episode: data.current_episode,
        status: data.status,
        rating: data.rating,
        notes: data.notes,
      });
      return withTVMeta(listItem, true);
    },
    update: async (id, data) => {
      await tvshowsApi.update(id, {
        title: data.title,
        total_episodes: data.total_episodes,
      });
      try {
        return withTVMeta(
          await tvshowsApi.updateList(id, {
            current_season: data.current_season,
            current_episode: data.current_episode,
            status: data.status,
            rating: data.rating,
            notes: data.notes,
          }),
          true,
        );
      } catch (err) {
        if (!isNotFoundError(err)) throw err;
        return withTVMeta(
          await tvshowsApi.addToList({
            id,
            current_season: data.current_season,
            current_episode: data.current_episode,
            status: data.status,
            rating: data.rating,
            notes: data.notes,
          }),
          true,
        );
      }
    },
    delete: async (id) => {
      await tvshowsApi.removeFromList(id);
    },
  },
  getDefaultFormState: () => ({
    current_season: 1,
    current_episode: 0,
    total_episodes: 12,
  }),
  FormFields: TVShowFormFields,
  CardDetails: TVShowCardDetails,
  updateProgress: async (item, increment, api) => {
    const tv = item as TVShowRecord;
    await api.update(tv.id, {
      ...tv,
      current_episode: (tv.current_episode || 0) + increment,
    });
  },
  getStatsSummary: (stats) => statsForCategory(stats, 'tv_shows'),
};
