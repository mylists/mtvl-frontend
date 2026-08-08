import React from 'react';
import { BarChart3, LayoutDashboard, Sparkles } from 'lucide-react';
import { useCategory } from '../context/CategoryContext';
import { getCategoryModule } from '../modules';

interface SidebarProps {
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { categories, activeCategory, setActiveCategory, stats } = useCategory();

  const getCategoryCount = (categoryName: string) => {
    if (!stats) return null;
    const mod = getCategoryModule(categoryName);
    if (mod.getStatsSummary) {
      const summary = mod.getStatsSummary(stats);
      return summary.total;
    }
    return null;
  };

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        {/* Main Nav Section */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Overview
          </h3>
          <button
            onClick={() => setActiveCategory('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeCategory === 'dashboard'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>Dashboard</span>
            </div>
            <BarChart3 className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>

        {/* Dynamic Categories Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tracking Categories
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              {categories.length}
            </span>
          </div>

          <div className="space-y-1">
            {categories.map((cat) => {
              const mod = getCategoryModule(cat.category, cat);
              const CategoryIcon = mod.icon;
              const isActive = activeCategory === cat.category;
              const count = getCategoryCount(cat.category);

              return (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(cat.category)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
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
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/15">
        <div className="flex items-center space-x-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200">Copyright 2026 Contributers</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Source code located at <a href="https://github.com/mylists">Github</a>
        </p>
      </div>
    </aside>
  );
};
