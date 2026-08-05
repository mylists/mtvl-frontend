import React, { useEffect, useState } from 'react';
import { X, Star, Save } from 'lucide-react';
import { Book, MediaItem, MediaStatus, Movie, TVShow } from '../types';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MediaItem>) => Promise<void>;
  categoryType: string; // 'movies', 'tvshows', 'books'
  initialData?: MediaItem | null;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryType,
  initialData,
}) => {
  const isMovie = categoryType === 'movies';
  const isTV = categoryType === 'tvshows';
  const isBook = categoryType === 'books';

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<MediaStatus>('watching');
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');

  // Movie fields
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [director, setDirector] = useState('');

  // TV fields
  const [currentSeason, setCurrentSeason] = useState<number>(1);
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [totalEpisodes, setTotalEpisodes] = useState<number>(12);

  // Book fields
  const [author, setAuthor] = useState('');
  const [pagesRead, setPagesRead] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(300);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setStatus(initialData.status || 'watching');
      setRating(initialData.rating || 0);
      setNotes(initialData.notes || '');

      if (isMovie) {
        const m = initialData as Movie;
        setReleaseYear(m.release_year || new Date().getFullYear());
        setDirector(m.director || '');
      } else if (isTV) {
        const t = initialData as TVShow;
        setCurrentSeason(t.current_season || 1);
        setCurrentEpisode(t.current_episode || 0);
        setTotalEpisodes(t.total_episodes || 0);
      } else if (isBook) {
        const b = initialData as Book;
        setAuthor(b.author || '');
        setPagesRead(b.pages_read || 0);
        setTotalPages(b.total_pages || 0);
      }
    } else {
      // Reset form defaults
      setTitle('');
      setStatus(isBook ? 'reading' : 'watching');
      setRating(5);
      setNotes('');
      setReleaseYear(new Date().getFullYear());
      setDirector('');
      setCurrentSeason(1);
      setCurrentEpisode(0);
      setTotalEpisodes(12);
      setAuthor('');
      setPagesRead(0);
      setTotalPages(300);
    }
    setError(null);
  }, [initialData, isOpen, categoryType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Partial<MediaItem> = {
        title: title.trim(),
        status,
        rating: Number(rating),
        notes: notes.trim(),
        categoryType,
      };

      if (initialData?.id) {
        payload.id = initialData.id;
      }

      if (isMovie) {
        (payload as Partial<Movie>).release_year = Number(releaseYear);
        (payload as Partial<Movie>).director = director.trim();
      } else if (isTV) {
        (payload as Partial<TVShow>).current_season = Number(currentSeason);
        (payload as Partial<TVShow>).current_episode = Number(currentEpisode);
        (payload as Partial<TVShow>).total_episodes = Number(totalEpisodes);
      } else if (isBook) {
        (payload as Partial<Book>).author = author.trim();
        (payload as Partial<Book>).pages_read = Number(pagesRead);
        (payload as Partial<Book>).total_pages = Number(totalPages);
      }

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-extrabold text-white mb-1">
          {initialData ? 'Edit' : 'Add New'}{' '}
          {categoryType.charAt(0).toUpperCase() + categoryType.slice(1, -1)}
        </h2>
        <p className="text-xs text-slate-400 mb-5">Fill in the details below to update your tracking list.</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Inception / Breaking Bad / Dune"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
            />
          </div>

          {/* Dynamic Fields for Movie */}
          {isMovie && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Release Year</label>
                <input
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(Number(e.target.value))}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Director</label>
                <input
                  type="text"
                  placeholder="Christopher Nolan"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {/* Dynamic Fields for TV Show */}
          {isTV && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Season</label>
                <input
                  type="number"
                  min="1"
                  value={currentSeason}
                  onChange={(e) => setCurrentSeason(Number(e.target.value))}
                  className="w-full glass-input px-3 py-2 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Ep</label>
                <input
                  type="number"
                  min="0"
                  value={currentEpisode}
                  onChange={(e) => setCurrentEpisode(Number(e.target.value))}
                  className="w-full glass-input px-3 py-2 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Eps</label>
                <input
                  type="number"
                  min="0"
                  value={totalEpisodes}
                  onChange={(e) => setTotalEpisodes(Number(e.target.value))}
                  className="w-full glass-input px-3 py-2 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {/* Dynamic Fields for Book */}
          {isBook && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Author</label>
                <input
                  type="text"
                  placeholder="Frank Herbert"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pages Read</label>
                  <input
                    type="number"
                    min="0"
                    value={pagesRead}
                    onChange={(e) => setPagesRead(Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Pages</label>
                  <input
                    type="number"
                    min="1"
                    value={totalPages}
                    onChange={(e) => setTotalPages(Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status & Rating Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MediaStatus)}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-sm font-medium bg-slate-900 cursor-pointer"
              >
                <option value={isBook ? 'reading' : 'watching'}>
                  {isBook ? 'Reading' : 'Watching'}
                </option>
                <option value="completed">Completed</option>
                <option value={isBook ? 'plan_to_read' : 'plan_to_watch'}>
                  Plan to {isBook ? 'Read' : 'Watch'}
                </option>
                <option value="dropped">Dropped</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rating (1-5)</label>
              <div className="flex items-center space-x-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700 hover:text-slate-500'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Review</label>
            <textarea
              rows={3}
              placeholder="Personal thoughts, favorite quotes, review..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
