import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (username: string, email: string) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('mtvl_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and verify user on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('mtvl_token');
      if (storedToken) {
        try {
          const currentUser = await authApi.getMe();
          setUser(currentUser);
          setToken(storedToken);
        } catch {
          // Token invalid or expired
          localStorage.removeItem('mtvl_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    const data = await authApi.login(usernameOrEmail, password);
    localStorage.setItem('mtvl_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (username: string, email: string, password: string) => {
    await authApi.register(username, email, password);
    // Auto login after successful registration
    await login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('mtvl_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (username: string, email: string) => {
    const updated = await authApi.updateMe(username, email);
    setUser(updated);
  };

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    await authApi.updatePassword(oldPassword, newPassword);
  };

  const deleteAccount = async () => {
    await authApi.deleteMe();
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
