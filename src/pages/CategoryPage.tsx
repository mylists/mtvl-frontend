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
  const resolvedItemId = itemId && !isNewItem ? itemId : null;

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
    if (!activeCategory) {
      setItems([]);
      return;
    }

    setIsLoadingItems(true);
    try {
      const categoryApi = getCategoryModule(activeCategory, currentCategoryInfo).api;
      const data = isAuthenticated ? await categoryApi.getAll() : await categoryApi.getCatalog();
      setItems(data);
    } catch (err) {
      console.error('Failed to load category items', err);
      setItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  }, [activeCategory, currentCategoryInfo, isAuthenticated]);

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

    if (!resolvedItemId) {
      setEditingItem(null);
      return;
    }

    const fromList = items.find((item) => item.id === resolvedItemId);
    if (fromList) {
      setEditingItem(fromList);
      setIsResolvingItem(false);
      return;
    }

    let cancelled = false;
    setIsResolvingItem(true);
    const categoryApi = getCategoryModule(activeCategory, currentCategoryInfo).api;
    const loadItem = isAuthenticated
      ? categoryApi.getById(resolvedItemId)
      : categoryApi.getCatalogById(resolvedItemId);

    loadItem
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
  }, [activeCategory, currentCategoryInfo, isAuthenticated, isNewItem, itemId, items, resolvedItemId]);

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

  const handleDeleteMediaItem = async (id: string) => {
    if (!window.confirm('Remove this item from your list? The shared catalog entry is kept.')) return;
    try {
      await getCategoryModule(activeCategory).api.delete(id);
      if (resolvedItemId === id) {
        closeItem();
      }
      await loadCategoryItems();
      await refreshStats();
    } catch (err) {
      console.error('Failed to remove item from list', err);
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

  const isModalOpen = (isAuthenticated && isNewItem) || Boolean(resolvedItemId && editingItem);

  return (
    <>
      <MediaGrid
        categoryTitle={categoryDisplayName}
        categoryType={activeCategory}
        items={items}
        isLoading={isLoadingItems || isResolvingItem}
        isPersonalList={isAuthenticated}
        onDeleteItem={handleDeleteMediaItem}
        onUpdateProgress={handleUpdateProgress}
      />

      <MediaModal
        isOpen={isModalOpen}
        onClose={closeItem}
        onSave={handleSaveMediaItem}
        categoryType={activeCategory}
        initialData={isNewItem ? null : editingItem}
        readOnly={!isAuthenticated}
      />
    </>
  );
};
