import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Button, Screen, ServiceState } from '../components/ui';
import { colors as c } from '../theme';
export const unstable_settings = { anchor: '(tabs)' };
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <SafeAreaProvider><Screen><ServiceState title="Une petite interruption" message="Impossible d’afficher cette page pour le moment." icon="alert-circle-outline" /><Button label="Réessayer" onPress={() => void retry()} /></Screen></SafeAreaProvider>;
}
export default function RootLayout() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 }, mutations: { retry: false } } }));
  useEffect(() => {
    if (Platform.OS === 'web') return;
    focusManager.setFocused(AppState.currentState === 'active');
    const listener = AppState.addEventListener('change', state => focusManager.setFocused(state === 'active'));
    return () => listener.remove();
  }, []);
  return <SafeAreaProvider><QueryClientProvider client={client}><StatusBar style="dark" /><Stack screenOptions={{ headerTintColor: c.text, headerStyle: { backgroundColor: c.background }, headerShadowVisible: false, contentStyle: { backgroundColor: c.background }, headerBackTitle: 'Retour' }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="search/index" options={{ title: 'Recherche' }} />
    <Stack.Screen name="venue/[id]" options={{ title: 'Le lieu' }} />
    <Stack.Screen name="menu/[id]" options={{ title: 'À la carte' }} />
    <Stack.Screen name="event/[id]" options={{ title: 'L’événement' }} />
    <Stack.Screen name="reservation/[id]" options={{ title: 'Réserver' }} />
    <Stack.Screen name="reviews/[id]" options={{ title: 'Les avis' }} />
    <Stack.Screen name="auth/login" options={{ title: 'Connexion' }} />
    <Stack.Screen name="auth/register" options={{ title: 'Inscription' }} />
    <Stack.Screen name="ai" options={{ title: 'Quivibe AI' }} />
    <Stack.Screen name="account/[section]" options={{ title: 'Mon espace' }} />
  </Stack></QueryClientProvider></SafeAreaProvider>;
}
