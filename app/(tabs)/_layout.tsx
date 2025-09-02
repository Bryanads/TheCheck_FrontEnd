import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Expo já vem com um pacote de ícones!
import Colors from '../../constants/Colors';

// Um componente auxiliar para os ícones das abas
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
        headerStyle: {
            backgroundColor: Colors.surface,
        },
        headerTintColor: Colors.dark.text,
      }}>
      <Tabs.Screen
        name="recommendations"
        options={{
          title: 'Recomendações',
          tabBarIcon: ({ color }) => <TabBarIcon name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="forecasts"
        options={{
          title: 'Previsões',
          tabBarIcon: ({ color }) => <TabBarIcon name="pulse" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon name="person-circle" color={color} />,
        }}
      />
    </Tabs>
  );
}