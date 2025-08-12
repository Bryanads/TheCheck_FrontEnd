// bryanads/thecheck_frontend/TheCheck_FrontEnd-f03cde61b76c4dc92c43cdfdefb847af8ae2bc19/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getUserProfile } from '../services/api';

interface AuthContextType {
  token: string | null;
  userId: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userId: string) => void;
  logout: () => void;
  updateUser: (user: User) => void; // Nova função
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('thecheck_token');
    const storedUserId = localStorage.getItem('thecheck_userId');
    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        try {
          const profile = await getUserProfile(userId);
          setUser(profile);
        } catch (error) {
          console.error("Failed to fetch user profile, logging out.", error);
          logout();
        }
      } else {
        setUser(null);
      }
    };
    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const login = (newToken: string, newUserId: string) => {
    localStorage.setItem('thecheck_token', newToken);
    localStorage.setItem('thecheck_userId', newUserId);
    setToken(newToken);
    setUserId(newUserId);
  };

  const logout = () => {
    localStorage.removeItem('thecheck_token');
    localStorage.removeItem('thecheck_userId');
    setToken(null);
    setUserId(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ token, userId, user, isAuthenticated: !!token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};