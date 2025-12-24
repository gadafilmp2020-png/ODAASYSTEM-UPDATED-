
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';

const STORAGE_KEY_SESSION = 'odaa_session_v30';

interface UserContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  registerUser: (data: any) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SESSION);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!currentUser;

  const login = useCallback(async (credentials: any) => {
    try {
      const data = await api.login(credentials);
      // Backend returns { ...user, token }
      setCurrentUser(data);
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(data));
    } catch (error) {
      throw error;
    }
  }, []);

  const registerUser = useCallback(async (data: any) => {
    await api.register(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    setCurrentUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    if (currentUser) {
      try {
        const data = await api.getDashboardData();
        setCurrentUser(prev => ({ ...prev, ...data.user }));
      } catch (e) {
        // If token invalid, logout
        logout();
      }
    }
  }, [currentUser, logout]);

  return (
    <UserContext.Provider value={{ 
        currentUser, 
        isAuthenticated, 
        login, 
        logout, 
        registerUser, 
        refreshSession
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
