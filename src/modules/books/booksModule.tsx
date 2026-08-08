import React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { booksApi } from '../../api/client';
import { Book } from '../../types';
import { CardDetailsProps, CategoryModule, FormFieldsProps } from '../types';

const BookFormFields: React.FC<FormFieldsProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Author</label>
        <input
          type="text"
          placeholder="Frank Herbert"
          value={formData.author ?? ''}
          onChange={(e) => onChange({ author: e.target.value })}
          className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Pages Read</label>
          <input
            type="number"
            min="0"
            value={formData.pages_read ?? 0}
            onChange={(e) => onChange({ pages_read: Number(e.target.value) })}
            className="w-full glass-input px-3 py-2 rounded-xl text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Total Pages</label>
          <input
            type="number"
            min="1"
            value={formData.total_pages ?? 300}
            onChange={(e) => onChange({ total_pages: Number(e.target.value) })}
            className="w-full glass-input px-3 py-2 rounded-xl text-sm"
          />
        </div>
      </div>
    </div>
  );
};

const BookCardDetails: React.FC<CardDetailsProps> = ({ item, onUpdateProgress }) => {
  const book = item as Book;
  return (
    <div className="space-y-1 text-xs text-slate-400">
      {book.author && (
        <p className="mb-1">
          Author: <strong className="text-slate-200">{book.author}</strong>
        </p>
      )}
      <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
        <span>
          Progress: <strong className="text-slate-200">{book.pages_read || 0}</strong> / {book.total_pages || '?'} pgs
        </span>
        {onUpdateProgress && (
          <button
            onClick={() => onUpdateProgress(item, 10)}
            className="px-2 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 text-[11px] font-bold transition-all flex items-center space-x-1"
            title="Increment read (+10 pgs)"
          >
            <Plus className="w-3 h-3" />
            <span>+10pgs</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const booksModule: CategoryModule<Book> = {
  id: 'books',
  displayName: 'Books',
  singularName: 'Book',
  description: 'Track novels, literature, non-fiction & reading goals',
  endpoint: '/api/v1/books',
  icon: BookOpen,
  color: {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    button: 'bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-500',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    iconText: 'text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
    shadow: 'shadow-emerald-600/30',
    accentText: 'text-emerald-300',
  },
  statuses: [
    { value: 'reading', label: 'Reading' },
    { value: 'completed', label: 'Completed' },
    { value: 'plan_to_read', label: 'Plan to Read' },
    { value: 'dropped', label: 'Dropped' },
    { value: 'on_hold', label: 'On Hold' },
  ],
  defaultStatus: 'reading',
  api: {
    getAll: async () => {
      const data = await booksApi.getAll();
      return data.map((b) => ({ ...b, categoryType: 'books' }));
    },
    getById: booksApi.getById,
    create: booksApi.create,
    update: booksApi.update,
    delete: booksApi.delete,
  },
  getDefaultFormState: () => ({
    author: '',
    pages_read: 0,
    total_pages: 300,
  }),
  FormFields: BookFormFields,
  CardDetails: BookCardDetails,
  updateProgress: async (item, increment, api) => {
    const bk = item as Book;
    const newPgs = (bk.pages_read || 0) + increment;
    await api.update(bk.id, { pages_read: newPgs });
  },
  getStatsSummary: (stats) => ({
    total: stats?.books?.total || 0,
    avgRating: stats?.books?.avg_rating || 0,
  }),
};
