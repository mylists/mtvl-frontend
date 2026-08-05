import React from 'react';
import { Star, Edit3, Trash2, Plus, Film, Tv, BookOpen, Clock, CheckCircle, Eye, XCircle } from 'lucide-react';
import { Book, MediaItem, MediaStatus, Movie, TVShow } from '../types';

interface MediaCardProps {
  item: MediaItem;
  onEdit: (item: MediaItem) => void;
  onDelete: (id: number) => void;
  onUpdateProgress?: (item: MediaItem, increment: number) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onEdit,
  onDelete,
  onUpdateProgress,
}) => {
  const isMovie = item.categoryType === 'movies';
  const isTV = item.categoryType === 'tvshows';
  const isBook = item.categoryType === 'books';

  const movie = item as Movie;
  const tv = item as TVShow;
  const book = item as Book;

  const getStatusBadge = (status: MediaStatus) => {
    switch (status) {
      case 'watching':
      case 'reading':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Eye className="w-3 h-3" />
            <span>{isBook ? 'Reading' : 'Watching'}</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'plan_to_watch':
      case 'plan_to_read':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>Plan to {isBook ? 'Read' : 'Watch'}</span>
          </span>
        );
      case 'dropped':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            <span>Dropped</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
            <span>{status.replace(/_/g, ' ')}</span>
          </span>
        );
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between group relative overflow-hidden">
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="p-1 rounded-lg bg-slate-800 text-indigo-400">
                {isMovie && <Film className="w-3.5 h-3.5" />}
                {isTV && <Tv className="w-3.5 h-3.5 text-purple-400" />}
                {isBook && <BookOpen className="w-3.5 h-3.5 text-emerald-400" />}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {item.categoryType}
              </span>
            </div>
            <h3 className="font-extrabold text-white text-base leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
              {item.title}
            </h3>
          </div>

          {getStatusBadge(item.status)}
        </div>

        {/* Details & Subtext */}
        <div className="space-y-1.5 text-xs text-slate-400 mb-4">
          {isMovie && (
            <>
              {movie.release_year && <p>Year: <strong className="text-slate-200">{movie.release_year}</strong></p>}
              {movie.director && <p>Director: <strong className="text-slate-200">{movie.director}</strong></p>}
            </>
          )}

          {isTV && (
            <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-800">
              <span>
                Season <strong className="text-slate-200">{tv.current_season || 1}</strong> • Ep <strong className="text-slate-200">{tv.current_episode || 0}</strong> / {tv.total_episodes || '∞'}
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
          )}

          {isBook && (
            <div>
              {book.author && <p className="mb-1">Author: <strong className="text-slate-200">{book.author}</strong></p>}
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
          )}

          {item.notes && (
            <p className="text-slate-400 italic text-[11px] line-clamp-2 pt-1 border-t border-slate-800/60 mt-2">
              "{item.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Footer Rating & Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div>{renderStars(item.rating)}</div>

        <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Edit item"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
