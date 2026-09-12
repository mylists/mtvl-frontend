import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bookmark,
  Globe,
  LayoutDashboard,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCategory } from '../context/CategoryContext';
import { isCategoryActive, publicCategoryPath } from '../lib/paths';
import { getCategoryModule } from '../modules';

export const Sidebar: React.FC = () => {
  const { categories, stats } = useCategory();
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const [categorySearch, setCategorySearch] = useState('');

  const dashboardActive = pathname === '/' || pathname === '/dashboard';

  const getCategoryCount = (categoryName: string) => {
    if (!stats) return null;
    const mod = getCategoryModule(categoryName);
    if (mod.getStatsSummary) {
      const summary = mod.getStatsSummary(stats);
      return summary.total;
    }
    return null;
  };

  const filteredPublicCategories = categories.filter((cat) => {
    if (!categorySearch.trim()) return true;
    const query = categorySearch.toLowerCase().trim();
    return (
      cat.display_name.toLowerCase().includes(query) ||
      cat.category.toLowerCase().includes(query) ||
      (cat.description && cat.description.toLowerCase().includes(query))
    );
  });

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 custom-scrollbar">
        {/* Overview Section */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Overview
          </h3>
          <Link
            to="/"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
              dashboardActive
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>Dashboard</span>
            </div>
            <BarChart3 className="w-3.5 h-3.5 opacity-60" />
          </Link>
        </div>

        {/* User Personal Tracking List Section (when logged in) */}
        {isAuthenticated && (
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <div className="flex items-center space-x-1.5">
                <Bookmark className="w-3 h-3 text-indigo-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Tracking Lists
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                {categories.length}
              </span>
            </div>

            <div className="space-y-1">
              {categories.map((cat) => {
                const mod = getCategoryModule(cat.category, cat);
                const CategoryIcon = mod.icon;
                const isActive = isCategoryActive(pathname, cat.category, false);
                const count = getCategoryCount(cat.category);

                return (
                  <Link
                    key={`tracking-${cat.category}`}
                    to={`/${mod.id}`}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={isActive ? 'text-indigo-400' : 'text-slate-400'}>
                        <CategoryIcon className="w-4 h-4" />
                      </span>
                      <span>{mod.displayName}</span>
                    </div>
                    {count !== null && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Public Listing & Category Search Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <div className="flex items-center space-x-1.5">
              <Globe className="w-3 h-3 text-cyan-400" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Public Listing
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              {categories.length}
            </span>
          </div>

          {/* Real-time Category Search Input */}
          <div className="relative px-1 mb-2">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
            {categorySearch && (
              <button
                onClick={() => setCategorySearch('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1">
            {filteredPublicCategories.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-slate-500">
                No categories match "{categorySearch}"
              </div>
            ) : (
              filteredPublicCategories.map((cat) => {
                const mod = getCategoryModule(cat.category, cat);
                const CategoryIcon = mod.icon;
                const isActive = isCategoryActive(pathname, cat.category, true);

                return (
                  <Link
                    key={`public-${cat.category}`}
                    to={publicCategoryPath(cat.category)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-inner'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                        <CategoryIcon className="w-4 h-4" />
                      </span>
                      <span>{mod.displayName}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Public
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/15">
        <div className="flex items-center space-x-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200">Copyright 2026 Contributers</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Source code located at <a href="https://github.com/mylists" className="text-indigo-400 hover:underline">Github</a>
        </p>
      </div>
    </aside>
  );
};