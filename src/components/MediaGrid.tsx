import React, { useState } from 'react';
import { ArrowUpDown, Filter, Plus, Search } from 'lucide-react';
import { getCategoryModule } from '../modules';
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
  categoryTitle: _categoryTitle,
  categoryType,
  items,
  isLoading,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onUpdateProgress,
}) => {
  const module = getCategoryModule(categoryType);
  const HeaderIcon = module.icon;

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-2xl ${module.color.iconBg} border flex items-center justify-center`}>
            <HeaderIcon className={`w-6 h-6 ${module.color.iconText}`} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{module.displayName}</h1>
            <p className="text-xs text-slate-400">
              Showing {filteredItems.length} of {items.length} logged items
            </p>
          </div>
        </div>

        <button
          onClick={onAddItem}
          className={`px-5 py-2.5 rounded-xl ${module.color.button} text-white font-bold text-sm transition-all flex items-center justify-center space-x-2`}
        >
          <Plus className="w-4 h-4" />
          <span>Add New {module.singularName}</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center glass-panel p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={`Filter ${module.displayName}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-9 pr-4 py-2 rounded-xl text-sm"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto py-1">
          <button
            onClick={() => setStatusFilter('all')}
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
                onClick={() => setStatusFilter(st.value)}
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
