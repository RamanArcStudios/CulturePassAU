import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { SavedProvider } from "@/contexts/SavedContext";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(onboarding)" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="event/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="community/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="business/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="movies/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="movies/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="restaurants/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="restaurants/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="activities/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="activities/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="shopping/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="shopping/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="profile/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="payment/methods" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="payment/transactions" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="payment/wallet" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="perks/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="notifications/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
      <Stack.Screen name="tickets/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="help/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="legal/terms" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="legal/privacy" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="legal/cookies" options={{ headerShown: false, animation: 'slide_from_right' }} />
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
        <GestureHandlerRootView>
          <KeyboardProvider>
            <OnboardingProvider>
              <SavedProvider>
                <StatusBar style="dark" />
                <RootLayoutNav />
              </SavedProvider>
            </OnboardingProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
