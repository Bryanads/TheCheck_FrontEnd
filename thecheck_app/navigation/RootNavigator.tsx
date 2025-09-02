import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Text, View } from 'react-native';



const AuthNavigator = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color: 'white' }}>Telas de Autenticação (Login/Cadastro)</Text>
  </View>
);

const MainAppNavigator = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color: 'white' }}>Telas Principais do App (Abas)</Text>
  </View>
);
// ---------------------------------------------


const RootNavigator = () => {
  const { session, loading } = useAuth();

  // Mostra uma tela de carregamento enquanto o AuthContext verifica a sessão
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        {/* Aqui podemos adicionar um ActivityIndicator (spinner) no futuro */}
        <Text style={{ color: 'white' }}>Carregando...</Text>
      </View>
    );
  }

  // Se não houver sessão, mostra o fluxo de autenticação.
  // Se houver sessão, mostra o aplicativo principal.
  return session ? <MainAppNavigator /> : <AuthNavigator />;
};

export default RootNavigator;