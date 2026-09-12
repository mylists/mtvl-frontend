import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Link2,
  Loader2,
  Plus,
  Save,
  Search,
  SearchX,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { itemShareUrl } from '../lib/paths';
import { getCategoryModule } from '../modules';
import { MediaItem, MediaStatus } from '../types';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MediaItem>) => Promise<void>;
  categoryType: string;
  initialData?: MediaItem | null;
  readOnly?: boolean;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryType,
  initialData,
  readOnly = false,
}) => {
  const { isAuthenticated } = useAuth();
  const module = getCategoryModule(categoryType);
  const FormFields = module.FormFields;
  const CategoryIcon = module.icon;

  const isEditing = Boolean(initialData?.id);
  const [stage, setStage] = useState<'search' | 'form'>(isEditing ? 'form' : 'search');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Selected catalog item if adding an existing catalog entry
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<MediaItem | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<MediaStatus>(module.defaultStatus);
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [customFormData, setCustomFormData] = useState<Record<string, any>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset or load initial data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialData?.id) {
      setStage('form');
      setSelectedCatalogItem(initialData);
      setTitle(initialData.title || '');
      setStatus(initialData.status || module.defaultStatus);
      setRating(initialData.rating || 5);
      setNotes(initialData.notes || '');
      setCustomFormData({ ...initialData });
    } else {
      setStage('search');
      setSelectedCatalogItem(null);
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
      setTitle('');
      setStatus(module.defaultStatus);
      setRating(5);
      setNotes('');
      setCustomFormData(module.getDefaultFormState());
    }
    setError(null);
    setCopied(false);
  }, [initialData, isOpen, categoryType]);

  // Handle ESC key
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

  // Live search in category catalog
  useEffect(() => {
    if (!isOpen || stage !== 'search') return;

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [catalogItems, userItems] = await Promise.all([
          module.api.getCatalog({ q: trimmed }).catch(() => []),
          isAuthenticated ? module.api.getAll({ q: trimmed }).catch(() => []) : Promise.resolve([]),
        ]);

        const userItemMap = new Map((userItems as MediaItem[]).map((u) => [u.id, u]));

        // Filter by search query client-side as well for accuracy
        const qLower = trimmed.toLowerCase();
        const merged: MediaItem[] = (catalogItems as MediaItem[])
          .filter((item) => item.title.toLowerCase().includes(qLower))
          .map((item) => {
            const userVersion = userItemMap.get(item.id);
            if (userVersion) {
              return {
                ...item,
                ...userVersion,
                onList: true,
              };
            }
            return {
              ...item,
              onList: false,
            };
          });

        setSearchResults(merged);
        setHasSearched(true);
      } catch (err) {
        console.error('Error searching category catalog', err);
        setSearchResults([]);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, stage, categoryType, isAuthenticated]);

  if (!isOpen) return null;

  const copyShareLink = async () => {
    const shareId = initialData?.id || selectedCatalogItem?.id;
    if (!shareId) return;
    try {
      await navigator.clipboard.writeText(itemShareUrl(categoryType, shareId));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error('Failed to copy share link', err);
    }
  };

  const handleSelectCatalogItem = (item: MediaItem) => {
    setSelectedCatalogItem(item);
    setTitle(item.title);
    setStatus(item.status || module.defaultStatus);
    setRating(item.rating || 5);
    setNotes(item.notes || '');
    setCustomFormData({ ...item });
    setStage('form');
  };

  const handleStartCreateNew = (newTitle?: string) => {
    const rawTitle = newTitle !== undefined ? newTitle : searchQuery;
    setSelectedCatalogItem(null);
    setTitle(rawTitle.trim());
    setStatus(module.defaultStatus);
    setRating(5);
    setNotes('');
    setCustomFormData(module.getDefaultFormState());
    setStage('form');
  };

  const handleBackToSearch = () => {
    setStage('search');
    setError(null);
  };

  const handleCustomFormChange = (updates: Partial<Record<string, any>>) => {
    setCustomFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Partial<MediaItem> = {
        ...customFormData,
        title: title.trim(),
        status,
        rating: Number(rating),
        notes: notes.trim(),
        categoryType: module.id,
      };

      const existingId = initialData?.id || selectedCatalogItem?.id;
      if (existingId) {
        payload.id = existingId;
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
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pr-10 mb-1">
          <div className="flex items-center space-x-2.5">
            {stage === 'form' && !isEditing && (
              <button
                type="button"
                onClick={handleBackToSearch}
                className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Back to search"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-xl font-extrabold text-white">
              {stage === 'search'
                ? `Find & Add ${module.singularName}`
                : isEditing
                ? `${readOnly ? 'View' : 'Edit'} ${module.singularName}`
                : selectedCatalogItem
                ? `Add ${selectedCatalogItem.title} to List`
                : `Create New ${module.singularName}`}
            </h2>
          </div>

          {(initialData?.id || selectedCatalogItem?.id) && (
            <button
              type="button"
              onClick={copyShareLink}
              className="shrink-0 inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Copy shareable link"
            >
              {copied ? <Copy className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy link'}</span>
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-4">
          {stage === 'search'
            ? `Search existing ${module.displayName.toLowerCase()} in catalog. If not found, you can create it.`
            : readOnly
            ? 'This is a public catalog item. Sign in to add it to your personal list.'
            : selectedCatalogItem && selectedCatalogItem.onList === false
            ? 'This item is in the shared catalog. Save to add it to your personal tracking list.'
            : 'Fill in the details below to update your tracking list.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* STAGE 1: SEARCH THE CATEGORY */}
        {stage === 'search' && (
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder={`Search ${module.displayName.toLowerCase()} by title...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input pl-10 pr-10 py-2.5 rounded-xl text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Results / Status Container */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  <p className="text-xs font-medium">Searching {module.displayName.toLowerCase()} catalog...</p>
                </div>
              ) : hasSearched && searchResults.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                    Existing Catalog Items ({searchResults.length})
                  </p>
                  <div className="space-y-1.5">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        className="glass-card p-3 rounded-xl flex items-center justify-between border border-slate-800 hover:border-indigo-500/40 transition-all gap-3 group"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className={`w-9 h-9 rounded-lg ${module.color.iconBg} border flex items-center justify-center shrink-0`}>
                            <CategoryIcon className={`w-4 h-4 ${module.color.iconText}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm truncate">{item.title}</p>
                            <div className="text-xs text-slate-400 truncate">
                              {item.categoryType === 'movies' && (
                                <>
                                  {item.release_year ? `${item.release_year}` : ''}
                                  {item.release_year && item.director ? ' • ' : ''}
                                  {item.director ? `Dir: ${item.director}` : ''}
                                </>
                              )}
                              {item.categoryType === 'tvshows' && (
                                <>
                                  {item.total_episodes ? `${item.total_episodes} eps` : 'Series'}
                                  {item.current_season ? ` • S${item.current_season}E${item.current_episode || 0}` : ''}
                                </>
                              )}
                              {item.categoryType === 'books' && (
                                <span>Book entry</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {item.onList ? (
                            <button
                              type="button"
                              onClick={() => handleSelectCatalogItem(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all flex items-center space-x-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>On List</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSelectCatalogItem(item)}
                              className={`px-3 py-1.5 rounded-lg ${module.color.button} text-white text-xs font-bold transition-all flex items-center space-x-1 shadow-sm`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fallback Option if none of the results are what user wanted */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleStartCreateNew(searchQuery)}
                      className="w-full p-2.5 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/50 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center space-x-2 transition-all bg-slate-900/30"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        Not listed? Create <strong>"{searchQuery}"</strong> as a new {module.singularName}
                      </span>
                    </button>
                  </div>
                </div>
              ) : hasSearched && searchResults.length === 0 ? (
                /* Item does not exist in category */
                <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
                    <SearchX className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      No matching {module.displayName.toLowerCase()} found
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-0.5">
                      "{searchQuery}" does not exist in the {module.displayName.toLowerCase()} catalog.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartCreateNew(searchQuery)}
                    className={`px-4 py-2 rounded-xl ${module.color.button} text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Create new {module.singularName} "{searchQuery}"</span>
                  </button>
                </div>
              ) : (
                /* Initial empty query state */
                <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
                  <div className={`w-12 h-12 rounded-2xl ${module.color.iconBg} border flex items-center justify-center`}>
                    <CategoryIcon className={`w-6 h-6 ${module.color.iconText}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Search {module.displayName}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-0.5">
                      Type the title of the {module.singularName.toLowerCase()} above to search the catalog before creating a new entry.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartCreateNew('')}
                    className="px-3.5 py-1.5 rounded-xl glass-card border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Or create custom {module.singularName.toLowerCase()} manually</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer (Search Stage) */}
            <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleStartCreateNew('')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                + Create manually
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: ENTRY / TRACKING FORM */}
        {stage === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder={`e.g. Enter ${module.singularName} title`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                readOnly={readOnly || (Boolean(selectedCatalogItem?.id) && !isEditing)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
            </div>

            {/* Plugged-in Category Custom Form Fields */}
            <fieldset disabled={readOnly}>
              <FormFields formData={customFormData} onChange={handleCustomFormChange} readOnly={readOnly} />
            </fieldset>

            {/* User Specific Fields: Status, Rating, Notes (Only rendered for personal list) */}
            {!readOnly && (
              <>
                {/* Status & Rating Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as MediaStatus)}
                      className="w-full glass-input px-3 py-2.5 rounded-xl text-sm font-medium bg-slate-900 cursor-pointer"
                    >
                      {module.statuses.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
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
              </>
            )}

            {/* Submit & Cancel Actions */}
            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                {readOnly ? 'Close' : 'Cancel'}
              </button>
              {!readOnly && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 rounded-xl ${module.color.button} text-white font-bold text-xs transition-all flex items-center space-x-1.5`}
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Saving...'
                      : selectedCatalogItem && selectedCatalogItem.onList === false
                      ? 'Add to List'
                      : initialData && initialData.onList === false
                      ? 'Add to List'
                      : 'Save Record'}
                  </span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

