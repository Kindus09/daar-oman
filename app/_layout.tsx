import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="(requester)" options={{ headerShown: false }} />
      <Stack.Screen name="(broker)" options={{ headerShown: false }} />
      <Stack.Screen name="request/create" options={{ title: "New Request", headerShown: true, presentation: "modal" }} />
      <Stack.Screen name="request/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="offer/create" options={{ title: "Send Offer", headerShown: true, presentation: "modal" }} />
      <Stack.Screen name="chat/[threadId]" options={{ headerShown: false }} />
      <Stack.Screen name="admin/index" options={{ title: "Admin", headerShown: true }} />
      <Stack.Screen
        name="close-request"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.45],
          sheetGrabberVisible: true,
          title: "Close Request",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.5],
          sheetGrabberVisible: true,
          title: "Report",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError || timedOut) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, timedOut]);

  if (!fontsLoaded && !fontError && !timedOut) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView>
          <KeyboardProvider>
            <AuthProvider>
              <RootLayoutNav />
            </AuthProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
