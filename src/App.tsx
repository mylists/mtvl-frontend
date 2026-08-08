import React, { useCallback, useEffect, useState } from 'react';
import { AuthModal } from './components/AuthModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ImportExportModal } from './components/ImportExportModal';
import { MediaGrid } from './components/MediaGrid';
import { MediaModal } from './components/MediaModal';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StatsDashboard } from './components/StatsDashboard';
import { UserProfileModal } from './components/UserProfileModal';
import { useAuth } from './context/AuthContext';
import { useCategory } from './context/CategoryContext';
import { getCategoryModule } from './modules';
import { MediaItem } from './types';

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

  // Fetch media items for active category module
  const loadCategoryItems = useCallback(async () => {
    if (!isAuthenticated || activeCategory === 'dashboard') {
      setItems([]);
      return;
    }

    setIsLoadingItems(true);
    try {
      const module = getCategoryModule(activeCategory);
      const data = await module.api.getAll();
      setItems(data);
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

  // Handle Save (Create / Edit via pluggable module API)
  const handleSaveMediaItem = async (payload: Partial<MediaItem>) => {
    const cat = payload.categoryType || activeCategory;
    const module = getCategoryModule(cat);

    if (payload.id) {
      await module.api.update(payload.id, payload);
    } else {
      await module.api.create(payload);
    }

    await loadCategoryItems();
    await refreshStats();
  };

  // Handle Delete (via pluggable module API)
  const handleDeleteMediaItem = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const module = getCategoryModule(activeCategory);
      await module.api.delete(id);
      await loadCategoryItems();
      await refreshStats();
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  // Handle quick progress increment via pluggable module progress handler
  const handleUpdateProgress = async (item: MediaItem, increment: number) => {
    try {
      const module = getCategoryModule(item.categoryType);
      if (module.updateProgress) {
        await module.updateProgress(item, increment, module.api);
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
