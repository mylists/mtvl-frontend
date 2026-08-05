import React, { createContext, useContext, useEffect, useState } from 'react';
import { categoriesApi, servicesApi } from '../api/client';
import { CategoryInfo, StatsOverview } from '../types';
import { useAuth } from './AuthContext';

interface CategoryContextType {
  categories: CategoryInfo[];
  activeCategory: string; // 'dashboard', 'movies', 'tvshows', 'books', or custom
  setActiveCategory: (cat: string) => void;
  isLoading: boolean;
  refreshCategories: () => Promise<void>;
  stats: StatsOverview | null;
  refreshStats: () => Promise<void>;
  backendConnected: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean>(true);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getCategories();
      setCategories(data);
      setBackendConnected(true);
    } catch {
      setBackendConnected(false);
      // Fallback default categories if server is starting or initializing
      setCategories([
        { category: 'movies', display_name: 'Movies', description: 'Track movies', endpoint: '/api/v1/movies' },
        { category: 'tvshows', display_name: 'TV Shows', description: 'Track TV series', endpoint: '/api/v1/tvshows' },
        { category: 'books', display_name: 'Books', description: 'Track reading progress', endpoint: '/api/v1/books' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await servicesApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats overview', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    // Periodic health / category check
    const interval = setInterval(async () => {
      const health = await servicesApi.checkHealth();
      setBackendConnected(health);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    } else {
      setStats(null);
    }
  }, [isAuthenticated]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        activeCategory,
        setActiveCategory,
        isLoading,
        refreshCategories: fetchCategories,
        stats,
        refreshStats: fetchStats,
        backendConnected,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};
