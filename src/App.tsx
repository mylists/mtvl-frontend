import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StatsDashboard } from './components/StatsDashboard';
import { MediaGrid } from './components/MediaGrid';
import { MediaModal } from './components/MediaModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ImportExportModal } from './components/ImportExportModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { useAuth } from './context/AuthContext';
import { useCategory } from './context/CategoryContext';
import { booksApi, moviesApi, tvshowsApi } from './api/client';
import { Book, MediaItem, Movie, TVShow } from './types';

export const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { activeCategory, setActiveCategory, categories, refreshStats } = useCategory();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // Modal controls
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Keyboard shortcut ⌘K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch media items for current category
  const loadCategoryItems = useCallback(async () => {
    if (!isAuthenticated || activeCategory === 'dashboard') {
      setItems([]);
      return;
    }

    setIsLoadingItems(true);
    try {
      if (activeCategory === 'movies') {
        const data = await moviesApi.getAll();
        setItems(data.map((m) => ({ ...m, categoryType: 'movies' })));
      } else if (activeCategory === 'tvshows' || activeCategory === 'tv_shows') {
        const data = await tvshowsApi.getAll();
        setItems(data.map((t) => ({ ...t, categoryType: 'tvshows' })));
      } else if (activeCategory === 'books') {
        const data = await booksApi.getAll();
        setItems(data.map((b) => ({ ...b, categoryType: 'books' })));
      } else {
        // Fallback or custom module handler
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to load category items', err);
      setItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  }, [activeCategory, isAuthenticated]);

  useEffect(() => {
    loadCategoryItems();
  }, [loadCategoryItems]);

  // Handle Save (Create / Edit)
  const handleSaveMediaItem = async (payload: Partial<MediaItem>) => {
    const cat = payload.categoryType || activeCategory;
    if (payload.id) {
      // Edit
      if (cat === 'movies') {
        await moviesApi.update(payload.id, payload as Partial<Movie>);
      } else if (cat === 'tvshows' || cat === 'tv_shows') {
        await tvshowsApi.update(payload.id, payload as Partial<TVShow>);
      } else if (cat === 'books') {
        await booksApi.update(payload.id, payload as Partial<Book>);
      }
    } else {
      // Create
      if (cat === 'movies') {
        await moviesApi.create(payload as Partial<Movie>);
      } else if (cat === 'tvshows' || cat === 'tv_shows') {
        await tvshowsApi.create(payload as Partial<TVShow>);
      } else if (cat === 'books') {
        await booksApi.create(payload as Partial<Book>);
      }
    }

    await loadCategoryItems();
    await refreshStats();
  };

  // Handle Delete
  const handleDeleteMediaItem = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      if (activeCategory === 'movies') {
        await moviesApi.delete(id);
      } else if (activeCategory === 'tvshows' || activeCategory === 'tv_shows') {
        await tvshowsApi.delete(id);
      } else if (activeCategory === 'books') {
        await booksApi.delete(id);
      }
      await loadCategoryItems();
      await refreshStats();
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  // Handle quick progress increment (+1 ep or +10 pgs)
  const handleUpdateProgress = async (item: MediaItem, increment: number) => {
    try {
      if (item.categoryType === 'tvshows') {
        const tv = item as TVShow;
        const newEp = (tv.current_episode || 0) + increment;
        await tvshowsApi.update(tv.id, { current_episode: newEp });
      } else if (item.categoryType === 'books') {
        const bk = item as Book;
        const newPgs = (bk.pages_read || 0) + increment;
        await booksApi.update(bk.id, { pages_read: newPgs });
      }
      await loadCategoryItems();
      await refreshStats();
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  const currentCategoryInfo = categories.find((c) => c.category === activeCategory);
  const categoryDisplayName = currentCategoryInfo ? currentCategoryInfo.display_name : activeCategory;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {activeCategory === 'dashboard' ? (
            <StatsDashboard
              onAddMedia={(cat) => {
                setActiveCategory(cat);
                setEditingItem(null);
                setIsMediaModalOpen(true);
              }}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          ) : (
            <MediaGrid
              categoryTitle={categoryDisplayName}
              categoryType={activeCategory}
              items={items}
              isLoading={isLoadingItems}
              onAddItem={() => {
                setEditingItem(null);
                setIsMediaModalOpen(true);
              }}
              onEditItem={(item) => {
                setEditingItem(item);
                setIsMediaModalOpen(true);
              }}
              onDeleteItem={handleDeleteMediaItem}
              onUpdateProgress={handleUpdateProgress}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSave={handleSaveMediaItem}
        categoryType={activeCategory === 'dashboard' ? 'movies' : activeCategory}
        initialData={editingItem}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={(cat) => setActiveCategory(cat)}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onRefreshData={() => {
          loadCategoryItems();
          refreshStats();
        }}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};
