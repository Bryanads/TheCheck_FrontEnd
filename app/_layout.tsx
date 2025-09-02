import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Slot, useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import Colors from '../constants/Colors';

export default function RootLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só tomamos uma decisão de navegação depois que o AuthContext terminar de carregar.
    if (!loading) {
      if (session) {
        // Se há uma sessão, e o usuário está fora do fluxo principal,
        // o levamos para a primeira tela do app (aba de recomendações).
        router.replace('/(tabs)/recommendations'); 
      } else {
        // Se NÃO há sessão, o levamos para a tela de login.
        router.replace('/(auth)');
      }
    }
  }, [session, loading, router]); // O efeito roda sempre que a sessão ou o loading mudarem.

  // Enquanto o AuthContext está verificando a sessão, mostramos um indicador de carregamento.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // O <Slot> é o componente do Expo Router que renderiza a rota filha correta
  // (seja a tela de login ou as abas do app principal).
  return <Slot />;
}