import React, { useEffect, useState } from 'react';
import { Search, X, Film, Tv, BookOpen, Star, Loader2 } from 'lucide-react';
import { servicesApi } from '../api/client';
import { Book, Movie, SearchResults, TVShow } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (category: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await servicesApi.search(query.trim());
        setResults(res);
      } catch (err) {
        console.error('Search query error', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    (results?.movies?.length || 0) +
    (results?.tv_shows?.length || 0) +
    (results?.books?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="relative mb-4">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-indigo-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search across all categories (title, director, author, notes)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full glass-input pl-12 pr-10 py-3 rounded-2xl text-base placeholder-slate-500"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-3.5 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="absolute right-3.5 top-3.5 text-xs text-slate-400 border border-slate-700 px-2 py-0.5 rounded-md"
            >
              ESC
            </button>
          )}
        </div>

        {/* Status / Spinner */}
        {isSearching && (
          <div className="flex items-center justify-center py-8 text-slate-400 space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span className="text-sm font-medium">Searching backend database...</span>
          </div>
        )}

        {/* Results List */}
        {!isSearching && results && (
          <div className="overflow-y-auto space-y-6 pr-1 flex-1">
            <p className="text-xs text-slate-400 font-medium">
              Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
            </p>

            {/* Movies Results */}
            {results.movies?.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-400 mb-2">
                  <Film className="w-4 h-4 text-indigo-400" />
                  <span>Movies ({results.movies.length})</span>
                </div>
                <div className="space-y-2">
                  {results.movies.map((m: Movie) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        onSelectResult('movies');
                        onClose();
                      }}
                      className="cursor-pointer glass-card p-3 rounded-xl flex items-center justify-between hover:bg-indigo-600/10 border border-slate-800"
                    >
                      <div>
                        <p className="font-bold text-white text-sm">{m.title}</p>
                        <p className="text-xs text-slate-400">
                          {m.release_year ? `${m.release_year} • ` : ''}
                          {m.director || 'No director'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{m.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TV Shows Results */}
            {results.tv_shows?.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-400 mb-2">
                  <Tv className="w-4 h-4 text-purple-400" />
                  <span>TV Shows ({results.tv_shows.length})</span>
                </div>
                <div className="space-y-2">
                  {results.tv_shows.map((t: TVShow) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        onSelectResult('tvshows');
                        onClose();
                      }}
                      className="cursor-pointer glass-card p-3 rounded-xl flex items-center justify-between hover:bg-purple-600/10 border border-slate-800"
                    >
                      <div>
                        <p className="font-bold text-white text-sm">{t.title}</p>
                        <p className="text-xs text-slate-400">
                          Season {t.current_season || 1} • Ep {t.current_episode || 0}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{t.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Books Results */}
            {results.books?.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-400 mb-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Books ({results.books.length})</span>
                </div>
                <div className="space-y-2">
                  {results.books.map((b: Book) => (
                    <div
                      key={b.id}
                      onClick={() => {
                        onSelectResult('books');
                        onClose();
                      }}
                      className="cursor-pointer glass-card p-3 rounded-xl flex items-center justify-between hover:bg-emerald-600/10 border border-slate-800"
                    >
                      <div>
                        <p className="font-bold text-white text-sm">{b.title}</p>
                        <p className="text-xs text-slate-400">{b.author || 'Unknown Author'}</p>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{b.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isSearching && query && totalResults === 0 && (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm font-semibold">No matches found</p>
            <p className="text-xs text-slate-500">Try searching for a different keyword or title.</p>
          </div>
        )}
      </div>
    </div>
  );
};
