import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/lib/auth";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { SavedProvider } from "@/contexts/SavedContext";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="community/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="business/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
      <Stack.Screen name="profile/public" options={{ headerShown: false }} />
      <Stack.Screen name="profile/qr" options={{ headerShown: false }} />
      <Stack.Screen name="movies/index" options={{ headerShown: false }} />
      <Stack.Screen name="movies/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="restaurants/index" options={{ headerShown: false }} />
      <Stack.Screen name="restaurants/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="activities/index" options={{ headerShown: false }} />
      <Stack.Screen name="activities/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="shopping/index" options={{ headerShown: false }} />
      <Stack.Screen name="shopping/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="payment/methods" options={{ headerShown: false }} />
      <Stack.Screen name="payment/transactions" options={{ headerShown: false }} />
      <Stack.Screen name="payment/wallet" options={{ headerShown: false }} />
      <Stack.Screen name="tickets/index" options={{ headerShown: false }} />
      <Stack.Screen name="perks/index" options={{ headerShown: false }} />
      <Stack.Screen name="notifications/index" options={{ headerShown: false }} />
      <Stack.Screen name="help/index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <OnboardingProvider>
                <SavedProvider>
                  <RootLayoutNav />
                </SavedProvider>
              </OnboardingProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
