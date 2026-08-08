import React from 'react';
import { Activity, ArrowRight, Film, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCategory } from '../context/CategoryContext';
import { getAllCategoryModules, getCategoryModule } from '../modules';

interface StatsDashboardProps {
  onAddMedia: (category: string) => void;
  onOpenAuth: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ onAddMedia, onOpenAuth }) => {
  const { stats, categories, setActiveCategory } = useCategory();
  const { isAuthenticated } = useAuth();

  const registeredModules = getAllCategoryModules();

  const totalTracked = registeredModules.reduce((acc, mod) => {
    if (mod.getStatsSummary) {
      return acc + mod.getStatsSummary(stats).total;
    }
    return acc;
  }, 0);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4 shadow-xl">
          <Film className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-2">Welcome to MTVL</h2>
        <p className="text-slate-400 max-w-md mb-6 leading-relaxed">
          Log in or create an account to start tracking all your stuffs.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center space-x-2"
        >
          <span>Sign In / Create Account</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-purple-900/40 p-6 md:p-8 border border-indigo-500/20 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>Personal Media Vault</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
            Track, Rate & Discover
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            You currently have <strong className="text-indigo-300">{totalTracked} items</strong> logged across {registeredModules.map((m) => m.displayName.toLowerCase()).join(', ')}.
          </p>
          <div className="flex flex-wrap gap-3">
            {registeredModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => onAddMedia(mod.id)}
                  className={`px-4 py-2.5 rounded-xl ${mod.color.button} text-white text-xs font-bold transition-all flex items-center space-x-2`}
                >
                  <Icon className="w-4 h-4" />
                  <span>Add {mod.singularName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {registeredModules.map((mod) => {
          const Icon = mod.icon;
          const summary = mod.getStatsSummary ? mod.getStatsSummary(stats) : { total: 0, avgRating: 0 };

          return (
            <div
              key={mod.id}
              className={`glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between ${mod.color.borderHover} transition-all`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${mod.color.iconBg} border flex items-center justify-center ${mod.color.iconText}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{mod.displayName}</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-extrabold text-white">{summary.total}</span>
                  <span className="text-xs text-slate-400">logged</span>
                </div>
                <div className={`mt-3 flex items-center space-x-1.5 text-xs ${mod.color.accentText}`}>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">
                    {summary.avgRating ? summary.avgRating.toFixed(1) : '0.0'} / 5.0
                  </span>
                  <span className="text-slate-400 text-[11px] ml-1">(Average rating)</span>
                </div>
              </div>

              <button
                onClick={() => setActiveCategory(mod.id)}
                className={`mt-5 w-full py-2 rounded-xl glass-card text-xs font-semibold ${mod.color.accentText} hover:text-white flex items-center justify-center space-x-1 transition-all`}
              >
                <span>View {mod.displayName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Dynamic Module Showcase */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Active Registry Extensions</h3>
          </div>
          <span className="text-xs text-slate-400">Auto-discovered via /api/v1/categories</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const mod = getCategoryModule(cat.category, cat);
            return (
              <div
                key={cat.category}
                onClick={() => setActiveCategory(cat.category)}
                className="cursor-pointer p-4 rounded-xl glass-card border border-slate-800/80 hover:border-indigo-500/40 transition-all flex items-start justify-between"
              >
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">{mod.displayName}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{cat.description || mod.description}</p>
                  <span className="inline-block mt-2 font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {cat.endpoint || mod.endpoint}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
