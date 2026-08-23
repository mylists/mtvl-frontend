import React from 'react';
import { BookOpen } from 'lucide-react';
import { booksApi, isNotFoundError } from '../../api/client';
import { Book, BookListItem } from '../../types';
import { CardDetailsProps, CategoryModule, FormFieldsProps, statsForCategory } from '../types';

type BookRecord = BookListItem & { categoryType?: string; onList?: boolean };

function withBookMeta(item: Book | BookListItem, onList: boolean): BookRecord {
  return {
    rating: 0,
    notes: '',
    status: 'plan_to_read',
    ...item,
    categoryType: 'books',
    onList,
  };
}

const BookFormFields: React.FC<FormFieldsProps> = () => null;

const BookCardDetails: React.FC<CardDetailsProps> = () => null;

export const booksModule: CategoryModule<BookRecord> = {
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
  defaultStatus: 'plan_to_read',
  api: {
    getAll: async () => {
      const data = await booksApi.getList();
      return data.map((b) => withBookMeta(b, true));
    },
    getById: async (id) => {
      try {
        return withBookMeta(await booksApi.getListItem(id), true);
      } catch (err) {
        if (!isNotFoundError(err)) throw err;
        return withBookMeta(await booksApi.getById(id), false);
      }
    },
    create: async (data) => {
      const catalog = await booksApi.create({
        title: data.title ?? '',
      });
      const listItem = await booksApi.addToList({
        id: catalog.id,
        status: data.status,
        rating: data.rating,
        notes: data.notes,
      });
      return withBookMeta(listItem, true);
    },
    update: async (id, data) => {
      await booksApi.update(id, {
        title: data.title,
      });
      try {
        return withBookMeta(
          await booksApi.updateList(id, {
            status: data.status,
            rating: data.rating,
            notes: data.notes,
          }),
          true,
        );
      } catch (err) {
        if (!isNotFoundError(err)) throw err;
        return withBookMeta(
          await booksApi.addToList({
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
      await booksApi.removeFromList(id);
    },
  },
  getDefaultFormState: () => ({}),
  FormFields: BookFormFields,
  CardDetails: BookCardDetails,
  getStatsSummary: (stats) => statsForCategory(stats, 'books'),
};
