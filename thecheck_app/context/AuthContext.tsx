import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../api/supabaseClient';
import { getUserProfile } from '../api'; // Importa a função da nossa API
import { Profile } from '../types'; // Importa o tipo do nosso perfil

interface AuthContextType {
  session: Session | null;
  profile: Profile | null; // Armazenará o perfil completo da nossa API
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        setSession(session);
        
        // Se o usuário está logado, busca o perfil na nossa API
        if (session) {
          try {
            const userProfile = await getUserProfile();
            setProfile(userProfile);
          } catch (error) {
            console.error("Erro ao buscar perfil do usuário:", error);
            // Se falhar, desloga o usuário para evitar um estado inconsistente
            await supabase.auth.signOut();
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
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