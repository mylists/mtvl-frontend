import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowUpDown, Filter, Plus, Search } from 'lucide-react';
import { newItemPath } from '../lib/paths';
import { getCategoryModule } from '../modules';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface MediaGridProps {
  categoryTitle: string;
  categoryType: string;
  items: MediaItem[];
  isLoading: boolean;
  isPersonalList: boolean;
  onDeleteItem: (id: string) => void;
  onUpdateProgress?: (item: MediaItem, increment: number) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  categoryTitle: _categoryTitle,
  categoryType,
  items,
  isLoading,
  isPersonalList,
  onDeleteItem,
  onUpdateProgress,
}) => {
  const module = getCategoryModule(categoryType);
  const HeaderIcon = module.icon;
  const { search } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const addHref = { pathname: newItemPath(categoryType), search };

  const searchTerm = searchParams.get('q') ?? '';
  const statusFilter = searchParams.get('status') ?? 'all';
  const sortBy = (searchParams.get('sort') as 'title' | 'rating' | 'id') || 'id';

  const updateParam = (key: string, value: string, defaultValue: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const filteredItems = items
    .filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !isPersonalList || statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (isPersonalList && sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
      const aTime = a.updated_at || a.created_at || a.id;
      const bTime = b.updated_at || b.created_at || b.id;
      return String(bTime).localeCompare(String(aTime));
    });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-2xl ${module.color.iconBg} border flex items-center justify-center`}>
            <HeaderIcon className={`w-6 h-6 ${module.color.iconText}`} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{module.displayName}</h1>
            <p className="text-xs text-slate-400">
              {isPersonalList
                ? `Showing ${filteredItems.length} of ${items.length} items on your list`
                : `Browsing ${filteredItems.length} of ${items.length} public catalog items`}
            </p>
          </div>
        </div>

        {isPersonalList ? (
          <Link
            to={addHref}
            className={`px-5 py-2.5 rounded-xl ${module.color.button} text-white font-bold text-sm transition-all flex items-center justify-center space-x-2`}
          >
            <Plus className="w-4 h-4" />
            <span>Add New {module.singularName}</span>
          </Link>
        ) : (
          <p className="text-xs text-slate-400">Sign in to create records or add them to your list.</p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3 justify-between items-center glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={`Filter ${module.displayName}...`}
            value={searchTerm}
            onChange={(e) => updateParam('q', e.target.value, '')}
            className="w-full glass-input pl-9 pr-4 py-2 rounded-xl text-sm"
          />
        </div>

        {isPersonalList && <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto py-1">
          <button
            onClick={() => updateParam('status', 'all', 'all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Statuses
          </button>
          {module.statuses.map((st) => {
            const isActive = statusFilter === st.value;
            return (
              <button
                key={st.value}
                onClick={() => updateParam('status', st.value, 'all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>}

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => updateParam('sort', e.target.value, 'id')}
            className="glass-input px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <option value="id" className="bg-slate-900">Recently Added</option>
            {isPersonalList && <option value="rating" className="bg-slate-900">Highest Rated</option>}
            <option value="title" className="bg-slate-900">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="glass-card rounded-2xl p-5 h-48 animate-pulse bg-slate-900/40" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No items found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            No entries match your search or filter criteria. Try clearing filters or add a new record.
          </p>
          {isPersonalList && (
            <Link
              to={addHref}
              className="inline-flex px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/30"
            >
              Add New Item
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              readOnly={!isPersonalList}
              onDelete={onDeleteItem}
              onUpdateProgress={isPersonalList ? onUpdateProgress : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
