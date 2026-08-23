import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, Film, Tv, BookOpen, Star, Loader2 } from 'lucide-react';
import { servicesApi } from '../api/client';
import { itemPath } from '../lib/paths';
import { Book, Movie, SearchResults, TVShow } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuery(searchParams.get('q') ?? '');
    }
  }, [isOpen, searchParams]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const updateQuery = (value: string) => {
    setQuery(value);
    const next = new URLSearchParams(searchParams);
    if (value.trim()) {
      next.set('q', value);
    } else {
      next.delete('q');
    }
    setSearchParams(next, { replace: true });
  };

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

  const resultLinkClass =
    'glass-card p-3 rounded-xl flex items-center justify-between border border-slate-800';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
        <div className="relative mb-4">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-indigo-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search across all categories (title, director, author, notes)..."
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            className="w-full glass-input pl-12 pr-10 py-3 rounded-2xl text-base placeholder-slate-500"
          />
          {query ? (
            <button
              onClick={() => updateQuery('')}
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

        {isSearching && (
          <div className="flex items-center justify-center py-8 text-slate-400 space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span className="text-sm font-medium">Searching backend database...</span>
          </div>
        )}

        {!isSearching && results && (
          <div className="overflow-y-auto space-y-6 pr-1 flex-1">
            <p className="text-xs text-slate-400 font-medium">
              Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
            </p>

            {results.movies?.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-400 mb-2">
                  <Film className="w-4 h-4 text-indigo-400" />
                  <span>Movies ({results.movies.length})</span>
                </div>
                <div className="space-y-2">
                  {results.movies.map((m: Movie) => (
                    <Link
                      key={m.id}
                      to={itemPath('movies', m.id)}
                      className={`${resultLinkClass} hover:bg-indigo-600/10`}
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
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.tv_shows?.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-400 mb-2">
                  <Tv className="w-4 h-4 text-purple-400" />
                  <span>TV Shows ({results.tv_shows.length})</span>
                </div>
                <div className="space-y-2">
                  {results.tv_shows.map((t: TVShow) => (
                    <Link
                      key={t.id}
                      to={itemPath('tvshows', t.id)}
                      className={`${resultLinkClass} hover:bg-purple-600/10`}
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
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.books?.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-400 mb-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Books ({results.books.length})</span>
                </div>
                <div className="space-y-2">
                  {results.books.map((b: Book) => (
                    <Link
                      key={b.id}
                      to={itemPath('books', b.id)}
                      className={`${resultLinkClass} hover:bg-emerald-600/10`}
                    >
                      <div>
                        <p className="font-bold text-white text-sm">{b.title}</p>
                        <p className="text-xs text-slate-400">{b.author || 'Unknown Author'}</p>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{b.rating}</span>
                      </div>
                    </Link>
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
