import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowUpDown, Film, Tv, BookOpen, Layers } from 'lucide-react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface MediaGridProps {
  categoryTitle: string;
  categoryType: string;
  items: MediaItem[];
  isLoading: boolean;
  onAddItem: () => void;
  onEditItem: (item: MediaItem) => void;
  onDeleteItem: (id: number) => void;
  onUpdateProgress?: (item: MediaItem, increment: number) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  categoryTitle,
  categoryType,
  items,
  isLoading,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onUpdateProgress,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'rating' | 'id'>('id');

  const filteredItems = items
    .filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.id - a.id;
    });

  const getHeaderIcon = () => {
    switch (categoryType.toLowerCase()) {
      case 'movies':
        return <Film className="w-6 h-6 text-indigo-400" />;
      case 'tvshows':
      case 'tv_shows':
        return <Tv className="w-6 h-6 text-purple-400" />;
      case 'books':
        return <BookOpen className="w-6 h-6 text-emerald-400" />;
      default:
        return <Layers className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            {getHeaderIcon()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{categoryTitle}</h1>
            <p className="text-xs text-slate-400">
              Showing {filteredItems.length} of {items.length} logged items
            </p>
          </div>
        </div>

        <button
          onClick={onAddItem}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {categoryTitle.slice(0, -1)}</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center glass-panel p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={`Filter ${categoryTitle}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-9 pr-4 py-2 rounded-xl text-sm"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto py-1">
          {['all', 'watching', 'reading', 'completed', 'plan_to_watch', 'dropped'].map((st) => {
            if (st === 'reading' && categoryType !== 'books') return null;
            if (st === 'watching' && categoryType === 'books') return null;
            if (st === 'plan_to_watch' && categoryType === 'books') st = 'plan_to_read';

            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {st === 'all'
                  ? 'All Statuses'
                  : st.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'title' | 'rating' | 'id')}
            className="glass-input px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <option value="id" className="bg-slate-900">Recently Added</option>
            <option value="rating" className="bg-slate-900">Highest Rated</option>
            <option value="title" className="bg-slate-900">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
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
          <button
            onClick={onAddItem}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/30"
          >
            Add New Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              onUpdateProgress={onUpdateProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
};
