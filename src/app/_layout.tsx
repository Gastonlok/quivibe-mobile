import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useNetworkState } from "expo-network";
import { useEffect, useState } from "react";
import {
  AppState,
  Platform,
  Text,
  View,
  ActivityIndicator,
  Animated,
  AccessibilityInfo,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { fonts, typography as t } from "../typography";
import { Button, Screen, ServiceState } from "../components/ui";
import { colors as c } from "../theme";
import { SessionProvider, useSession } from "../store/session";
import { PreferencesProvider, usePreferences } from "../store/preferences";
void SplashScreen.preventAutoHideAsync().catch(() => {});
export const unstable_settings = { anchor: "(tabs)" };
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaProvider>
      <Screen>
        <ServiceState
          title="Une petite interruption"
          message="Impossible d’afficher cette page pour le moment."
          icon="alert-circle-outline"
        />
        <Button label="Réessayer" onPress={() => void retry()} />
      </Screen>
    </SafeAreaProvider>
  );
}
function Loading() {
  const [opacity] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (active)
        Animated.timing(opacity, {
          toValue: 1,
          duration: reduce ? 0 : 180,
          useNativeDriver: true,
        }).start();
    });
    return () => {
      active = false;
      opacity.stopAnimation();
    };
  }, [opacity]);
  return (
    <Animated.View
      onLayout={() => void SplashScreen.hideAsync().catch(() => {})}
      style={{ flex: 1, backgroundColor: c.background, opacity }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: c.background,
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <StatusBar style="dark" />
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 28,
            backgroundColor: c.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
          accessible={false}
        >
          <Text
            style={[
              t.title,
              { fontSize: 48, lineHeight: 62, color: c.secondary },
            ]}
          >
            Q
          </Text>
        </View>
        <View style={{ alignItems: "center", gap: 6 }}>
          <Text style={[t.title, { letterSpacing: 3, color: c.text }]}>
            QUIVIBE
          </Text>
          <Text style={[t.body, { color: c.muted }]}>
            Ta vibe. Ton endroit.
          </Text>
        </View>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Chargement de Quivibe"
          accessibilityState={{ busy: true }}
          style={{ alignItems: "center", gap: 12, marginTop: 24 }}
        >
          <ActivityIndicator size="large" color={c.primaryText} />
          <Text style={[t.caption, { color: c.muted }]}>
            Préparation de ton espace…
          </Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}
function Navigation() {
  const [introComplete, setIntroComplete] = useState(false);
  useEffect(() => {
    // Keep the startup identity readable even when local storage loads instantly.
    const timer = setTimeout(() => setIntroComplete(true), 900);
    return () => clearTimeout(timer);
  }, []);
  const prefs = usePreferences(),
    session = useSession(),
    network = useNetworkState();
  const offline =
    network.isConnected === false || network.isInternetReachable === false;
  useEffect(() => {
    onlineManager.setOnline(!offline);
  }, [offline]);
  if (!introComplete || !prefs.ready || !session.ready) return <Loading />;
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      {offline && (
        <SafeAreaView edges={["top"]} style={{ backgroundColor: c.soft }}>
          <Text
            accessibilityRole="alert"
            style={[t.caption, { textAlign: "center", padding: 6 }]}
          >
            Hors connexion · tes données déjà chargées restent visibles
          </Text>
        </SafeAreaView>
      )}
      <Stack
        screenOptions={{
          headerTintColor: c.text,
          headerStyle: { backgroundColor: c.background },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: c.background },
          headerTitleStyle: {
            fontFamily: fonts.bold,
            fontSize: 18,
            fontWeight: "400",
          },
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Protected guard={!prefs.value.completed}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={prefs.value.completed}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="search/index" options={{ title: "Recherche" }} />
          <Stack.Screen name="venue/[id]" options={{ title: "Le lieu" }} />
          <Stack.Screen name="menu/[id]" options={{ title: "À la carte" }} />
          <Stack.Screen name="event/[id]" options={{ title: "L’événement" }} />
          <Stack.Screen
            name="reservation/[id]"
            options={{ title: "Réserver" }}
          />
          <Stack.Screen
            name="confirmation/[reference]"
            options={{ title: "Ta réservation", gestureEnabled: false }}
          />
          <Stack.Screen name="reviews/[id]" options={{ title: "Les avis" }} />
          <Stack.Screen name="auth/login" options={{ title: "Connexion" }} />
          <Stack.Screen
            name="auth/register"
            options={{ title: "Inscription" }}
          />
          <Stack.Screen name="ai" options={{ title: "Quivibe AI" }} />
          <Stack.Screen
            name="account/[section]"
            options={{ title: "Mon espace" }}
          />
        </Stack.Protected>
      </Stack>
    </View>
  );
}
export default function RootLayout() {
  const [loaded, error] = useFonts({
    [fonts.regular]: require("@expo-google-fonts/noto-sans/400Regular/NotoSans_400Regular.ttf"),
    [fonts.bold]: require("@expo-google-fonts/noto-sans/700Bold/NotoSans_700Bold.ttf"),
  });
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60000, retry: 1 },
          mutations: { retry: false },
        },
      }),
  );
  useEffect(() => {
    if (error) void SplashScreen.hideAsync().catch(() => {});
  }, [error]);
  useEffect(() => {
    if (Platform.OS === "web") return;
    const listener = AppState.addEventListener("change", (state) =>
      focusManager.setFocused(state === "active"),
    );
    return () => listener.remove();
  }, []);
  if (error) throw error;
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <SessionProvider>
          <PreferencesProvider>
            <Navigation />
          </PreferencesProvider>
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
