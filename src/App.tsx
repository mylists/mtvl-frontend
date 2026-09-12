import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthModal } from './components/AuthModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ImportExportModal } from './components/ImportExportModal';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StatsDashboard } from './components/StatsDashboard';
import { UserProfileModal } from './components/UserProfileModal';
import { useAuth } from './context/AuthContext';
import { useCategory } from './context/CategoryContext';
import { formatPageTitle } from './lib/constants';
import { parseAppLocation, searchPath } from './lib/paths';
import { CategoryPage } from './pages/CategoryPage';

export const AppContent: React.FC = () => {
  const { isLoading: authLoading } = useAuth();
  const { refreshStats, refreshLibrary } = useCategory();
  const location = useLocation();
  const navigate = useNavigate();
  const { isSearch } = parseAppLocation(location.pathname);

  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate(searchPath());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    const parsed = parseAppLocation(location.pathname);
    if (parsed.isSearch) {
      document.title = formatPageTitle('Search');
    } else if (parsed.isDashboard) {
      document.title = formatPageTitle();
    }
  }, [location.pathname]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col selection:bg-indigo-600 selection:text-white">
      <Navbar
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route
              path="/"
              element={
                <StatsDashboard
                  onOpenAuth={() => setIsAuthOpen(true)}
                />
              }
            />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route
              path="/search"
              element={
                <StatsDashboard
                  onOpenAuth={() => setIsAuthOpen(true)}
                />
              }
            />
            <Route path="/public/:category/:itemId?" element={<CategoryPage isPublicView={true} />} />
            <Route path="/:category/:itemId?" element={<CategoryPage />} />
          </Routes>
        </main>
      </div>

      <GlobalSearchModal
        isOpen={isSearch}
        onClose={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onRefreshData={() => {
          refreshLibrary();
          refreshStats();
        }}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};