import React, { useState } from 'react';
import {
  Search,
  LogOut,
  Settings,
  Download,
  CheckCircle2,
  AlertCircle,
  Film,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCategory } from '../context/CategoryContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenImportExport: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenImportExport,
  onOpenAuth,
  onOpenProfile,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { backendConnected } = useCategory();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand Logo & Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Film className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
              MTVL
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              v{__APP_VERSION__}
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Tracking List</p>
        </div>
      </div>

      {/* Center Search Trigger */}
      <div className="flex-1 max-w-md mx-4 sm:mx-8">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between glass-input px-4 py-2 rounded-xl text-slate-400 text-sm hover:border-indigo-500/50 transition-all group"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            <span>Search movies, TV shows, books...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-700 rounded-md">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        {/* Backend Health Badge */}
        <div
          title={backendConnected ? 'Backend API Connected' : 'Backend Disconnected'}
          className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${backendConnected
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
            }`}
        >
          {backendConnected ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>API Live</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>API Offline</span>
            </>
          )}
        </div>

        {/* Data Import / Export */}
        {isAuthenticated && (
          <button
            onClick={onOpenImportExport}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white glass-card hover:bg-slate-800 transition-all"
            title="Import/Export Library"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Data</span>
          </button>
        )}

        {/* User Auth Dropdown */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-1.5 rounded-xl glass-card hover:border-indigo-500/50 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-slate-200 hidden md:inline max-w-[120px] truncate">
                {user.username}
              </span>
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl py-2 z-50 border border-slate-800">
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onOpenProfile();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center space-x-2 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-indigo-400" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 hover:opacity-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
