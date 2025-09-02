import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* Futuramente, poderíamos adicionar a tela de "Esqueci a Senha" aqui */}
      {/* <Stack.Screen name="forgot-password" /> */}
    </Stack>
  );
}