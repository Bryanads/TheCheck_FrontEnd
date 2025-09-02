import React from 'react';
import { AuthProvider } from './context/AuthContext';
import RootNavigator from './navigation/RootNavigator'; // Criaremos este arquivo a seguir
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Cria uma instância do cliente do TanStack Query
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* O RootNavigator irá decidir qual fluxo mostrar (Auth, Onboarding, Main) */}
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}