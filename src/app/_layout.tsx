import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { useColorScheme } from "@/shared/hooks/use-color-scheme";
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
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthGate>
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal", title: "Modal" }}
                />
              </Stack>
            </AuthGate>
            <StatusBar style="auto" />
            <Toast />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
