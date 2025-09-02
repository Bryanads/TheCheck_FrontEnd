import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../api/supabaseClient';
import { getUserProfile } from '../api';
import { Profile } from '../types';

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      // 1. Verifica a sessão existente ao carregar o app
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        try {
          const userProfile = await getUserProfile();
          setProfile(userProfile);
        } catch (error) {
          console.error("Erro ao buscar perfil do usuário na sessão inicial:", error);
          await supabase.auth.signOut();
          setProfile(null);
        }
      }
      
      // 2. Marca o carregamento como concluído
      setLoading(false);
    };

    fetchSession();

    // 3. Ouve por futuras mudanças (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
            // Se o evento for SIGNED_IN, busca o perfil
            if (event === 'SIGNED_IN') {
                setLoading(true);
                try {
                    const userProfile = await getUserProfile();
                    setProfile(userProfile);
                } catch (error) {
                    console.error("Erro ao buscar perfil do usuário após login:", error);
                } finally {
                    setLoading(false);
                }
            }
        } else {
            setProfile(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const value = {
    session,
    profile,
    loading,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook customizado para usar o contexto facilmente
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};