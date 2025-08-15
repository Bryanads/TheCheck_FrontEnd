import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getUserProfile } from '../services/api';

// --- CHAVES DE CACHE CENTRALIZADAS E EXPORTADAS ---
export const TOKEN_KEY = 'thecheck_token';
export const USER_ID_KEY = 'thecheck_userId';
export const USER_PROFILE_CACHE_KEY = 'thecheck_user_profile'; // Mantido para o perfil do usuário
export const THECHECK_CACHE_KEY = 'thecheck_cache'; // Nova chave principal

interface AuthContextType {
  token: string | null;
  userId: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userId: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUserId = localStorage.getItem(USER_ID_KEY);
    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        const cachedUserStr = sessionStorage.getItem(USER_PROFILE_CACHE_KEY);
        if (cachedUserStr) {
          setUser(JSON.parse(cachedUserStr));
          return;
        }

        try {
          const profile = await getUserProfile(userId);
          setUser(profile);
          sessionStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(profile));
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
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_ID_KEY, newUserId);
    setToken(newToken);
    setUserId(newUserId);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setUser(null);

    // Limpa todas as chaves de cache relevantes
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(THECHECK_CACHE_KEY); // Limpa o cache principal
    sessionStorage.clear(); // Limpa a sessão inteira
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    sessionStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(updatedUser));
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