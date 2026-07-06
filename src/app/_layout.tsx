import { QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { GlobalPlayer } from "@/domains/player/components/GlobalPlayer";
import { queryClient } from "@/shared/libs/queryClient";
import "../global.css";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading, restoreSession } = useAuthStore();
  const segments = useSegments();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { restoreSession(); }, []);

  if (isLoading) return null;

  const inAuthGroup = (segments[0] as string) === "(auth)";

  if (!user && !inAuthGroup) {
    return <Redirect href={"/(auth)/login" as any} />;
  }

  if (user && inAuthGroup) {
    return <Redirect href={"/(tabs)" as any} />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthGate>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="tracks" options={{ headerShown: false }} />
              <Stack.Screen name="artists" options={{ headerShown: false }} />
              <Stack.Screen name="playlists" options={{ headerShown: false }} />
              <Stack.Screen name="publish" options={{ headerShown: false }} />
              <Stack.Screen name="more" options={{ headerShown: false }} />
            </Stack>
          </AuthGate>
          <GlobalPlayer />
          <StatusBar style="auto" />
          <Toast />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
