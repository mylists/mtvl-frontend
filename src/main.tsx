import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppContent } from './App';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CategoryProvider>
        <AppContent />
      </CategoryProvider>
    </AuthProvider>
  </React.StrictMode>
);
