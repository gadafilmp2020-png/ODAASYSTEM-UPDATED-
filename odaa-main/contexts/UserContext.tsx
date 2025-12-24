
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types';
import { MOCK_USERS } from '../constants';

// Key for LocalStorage
const STORAGE_KEY_USERS = 'odaa_users_v30_ALGO_REFACTOR';
const STORAGE_KEY_SESSION = 'odaa_session_v30';

interface UserContextType {
  currentUser: User | null;
  allUsers: User[];
  isAuthenticated: boolean;
  login: (user: User, deviceId: string) => void;
  logout: () => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  registerUser: (newUser: User) => void;
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  refreshSession: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load Users from Storage or use Mocks
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS);
      return stored ? JSON.parse(stored) : MOCK_USERS;
    } catch (e) {
      console.error("Failed to load users", e);
      return MOCK_USERS;
    }
  });

  // Load Session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SESSION);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Derived state to ensure synchronization with currentUser
  const isAuthenticated = !!currentUser;

  // Persist Users whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  // Persist Session whenever current user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    }
  }, [currentUser]);

  const login = useCallback((user: User, deviceId: string) => {
    const updatedUser = { 
        ...user, 
        isOnline: true, 
        lastActive: new Date().toISOString() 
    };
    
    // Update in the main list
    setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  }, []);

  const logout = useCallback(() => {
    if (currentUser) {
        // Mark offline in list
        setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, isOnline: false } : u));
    }
    setCurrentUser(null);
  }, [currentUser]);

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    
    // If updating the currently logged in user, update local state too
    if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [currentUser]);

  const registerUser = useCallback((newUser: User) => {
      setAllUsers(prev => [...prev, newUser]);
  }, []);

  const refreshSession = useCallback(() => {
      if (currentUser) {
          const freshData = allUsers.find(u => u.id === currentUser.id);
          if (freshData) setCurrentUser(freshData);
      }
  }, [currentUser, allUsers]);

  return (
    <UserContext.Provider value={{ 
        currentUser, 
        allUsers, 
        isAuthenticated, 
        login, 
        logout, 
        updateUser, 
        registerUser, 
        setAllUsers,
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
