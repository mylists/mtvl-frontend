import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MediaGrid } from '../components/MediaGrid';
import { MediaModal } from '../components/MediaModal';
import { useAuth } from '../context/AuthContext';
import { useCategory } from '../context/CategoryContext';
import { categoryPath, normalizeCategorySlug } from '../lib/paths';
import { getCategoryModule } from '../modules';
import { MediaItem } from '../types';

export const CategoryPage: React.FC = () => {
  const { category: categoryParam, itemId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { categories, refreshStats, libraryRevision } = useCategory();

  const activeCategory = normalizeCategorySlug(categoryParam || '');
  const isNewItem = itemId === 'new';
  const numericItemId = itemId && itemId !== 'new' ? Number(itemId) : null;
  const hasValidItemId = numericItemId !== null && Number.isFinite(numericItemId);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isResolvingItem, setIsResolvingItem] = useState(false);

  const currentCategoryInfo = categories.find((c) => normalizeCategorySlug(c.category) === activeCategory);
  const module = getCategoryModule(activeCategory, currentCategoryInfo);
  const categoryDisplayName = currentCategoryInfo?.display_name || module.displayName;

  const closeItem = () => {
    navigate({ pathname: categoryPath(activeCategory), search: window.location.search });
  };

  const loadCategoryItems = useCallback(async () => {
    if (!isAuthenticated || !activeCategory) {
      setItems([]);
      return;
    }

    setIsLoadingItems(true);
    try {
      const data = await getCategoryModule(activeCategory).api.getAll();
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
  }, [loadCategoryItems, libraryRevision]);

  useEffect(() => {
    if (editingItem?.title) {
      document.title = `${editingItem.title} · ${categoryDisplayName} · MTVL`;
    } else {
      document.title = `${categoryDisplayName} · MTVL`;
    }
    return () => {
      document.title = 'MTVL';
    };
  }, [categoryDisplayName, editingItem]);

  useEffect(() => {
    if (!itemId || isNewItem) {
      setEditingItem(null);
      setIsResolvingItem(false);
      return;
    }

    if (!hasValidItemId) {
      setEditingItem(null);
      return;
    }

    const fromList = items.find((item) => item.id === numericItemId);
    if (fromList) {
      setEditingItem(fromList);
      setIsResolvingItem(false);
      return;
    }

    if (!isAuthenticated) {
      setEditingItem(null);
      return;
    }

    let cancelled = false;
    setIsResolvingItem(true);
    getCategoryModule(activeCategory)
      .api.getById(numericItemId)
      .then((item) => {
        if (!cancelled) {
          setEditingItem({ ...item, categoryType: item.categoryType || activeCategory });
        }
      })
      .catch(() => {
        if (!cancelled) setEditingItem(null);
      })
      .finally(() => {
        if (!cancelled) setIsResolvingItem(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory, hasValidItemId, isAuthenticated, isNewItem, itemId, items, numericItemId]);

  const handleSaveMediaItem = async (payload: Partial<MediaItem>) => {
    const cat = payload.categoryType || activeCategory;
    const targetModule = getCategoryModule(cat);

    if (payload.id) {
      await targetModule.api.update(payload.id, payload);
    } else {
      await targetModule.api.create(payload);
    }

    await loadCategoryItems();
    await refreshStats();
  };

  const handleDeleteMediaItem = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await getCategoryModule(activeCategory).api.delete(id);
      if (numericItemId === id) {
        closeItem();
      }
      await loadCategoryItems();
      await refreshStats();
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  const handleUpdateProgress = async (item: MediaItem, increment: number) => {
    try {
      const itemModule = getCategoryModule(item.categoryType);
      if (itemModule.updateProgress) {
        await itemModule.updateProgress(item, increment, itemModule.api);
      }
      await loadCategoryItems();
      await refreshStats();
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  const isModalOpen = isAuthenticated && (isNewItem || hasValidItemId);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-2xl font-extrabold text-white mb-2">{categoryDisplayName}</h2>
        <p className="text-slate-400 max-w-md leading-relaxed">
          Sign in to view this list. After you sign in, this same URL will open the shared page.
        </p>
      </div>
    );
  }

  return (
    <>
      <MediaGrid
        categoryTitle={categoryDisplayName}
        categoryType={activeCategory}
        items={items}
        isLoading={isLoadingItems || isResolvingItem}
        onDeleteItem={handleDeleteMediaItem}
        onUpdateProgress={handleUpdateProgress}
      />

      <MediaModal
        isOpen={isModalOpen}
        onClose={closeItem}
        onSave={handleSaveMediaItem}
        categoryType={activeCategory}
        initialData={isNewItem ? null : editingItem}
      />
    </>
  );
};
