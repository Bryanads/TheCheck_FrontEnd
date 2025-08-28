import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient'; // Importe o cliente Supabase
import { Session, User } from '@supabase/supabase-js'; // Importe os tipos do Supabase

// Não precisamos mais gerenciar o token manualmente, o Supabase faz isso.
// Mas mantemos a chave do cache principal
export const THECHECK_CACHE_KEY = 'thecheck_cache';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  // A função de login não é mais necessária, o Supabase gerencia isso
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Pega a sessão inicial, se houver
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Ouve mudanças no estado de autenticação (login, logout, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Limpa o listener quando o componente é desmontado
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Limpa o cache da aplicação ao fazer logout
    localStorage.removeItem(THECHECK_CACHE_KEY);
    sessionStorage.clear();
  };

  const value = {
    session,
    user,
    userId: user?.id || null,
    isAuthenticated: !!session,
    isLoading,
    logout: handleLogout,
  };
  
  // O updateUser pode ser adaptado para atualizar o perfil no Supabase se necessário
  // mas por enquanto, vamos focar na autenticação.

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
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