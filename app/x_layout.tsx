import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useCallback } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { SavedProvider } from "@/contexts/SavedContext";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { StatusBar } from "expo-status-bar";

// Keep the splash screen visible until fonts are ready
SplashScreen.preventAutoHideAsync();

// ─── Shared screen options ────────────────────────────────────────────────────
// Defined outside the component so the objects aren't recreated on every render,
// which would cause the Stack to unnecessarily re-evaluate its screen config.

const HIDDEN_HEADER = { headerShown: false } as const;
const SLIDE_RIGHT = { headerShown: false, animation: 'slide_from_right' } as const;
const SLIDE_BOTTOM = { headerShown: false, animation: 'slide_from_bottom' } as const;
const FADE = { headerShown: false, animation: 'fade' } as const;

// ─── RootLayoutNav ────────────────────────────────────────────────────────────

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      {/* Auth / onboarding */}
      <Stack.Screen name="(onboarding)" options={FADE} />

      {/* Main app */}
      <Stack.Screen name="(tabs)" options={HIDDEN_HEADER} />

      {/* Detail screens */}
      <Stack.Screen name="event/[id]"       options={SLIDE_RIGHT} />
      <Stack.Screen name="community/[id]"   options={SLIDE_RIGHT} />
      <Stack.Screen name="business/[id]"    options={SLIDE_RIGHT} />
      <Stack.Screen name="profile/[id]"     options={SLIDE_RIGHT} />

      {/* Movies */}
      <Stack.Screen name="movies/index"     options={SLIDE_RIGHT} />
      <Stack.Screen name="movies/[id]"      options={SLIDE_RIGHT} />

      {/* Restaurants */}
      <Stack.Screen name="restaurants/index" options={SLIDE_RIGHT} />
      <Stack.Screen name="restaurants/[id]"  options={SLIDE_RIGHT} />

      {/* Activities */}
      <Stack.Screen name="activities/index" options={SLIDE_RIGHT} />
      <Stack.Screen name="activities/[id]"  options={SLIDE_RIGHT} />

      {/* Shopping */}
      <Stack.Screen name="shopping/index"   options={SLIDE_RIGHT} />
      <Stack.Screen name="shopping/[id]"    options={SLIDE_RIGHT} />

      {/* Payment */}
      <Stack.Screen name="payment/methods"      options={SLIDE_RIGHT} />
      <Stack.Screen name="payment/transactions" options={SLIDE_RIGHT} />
      <Stack.Screen name="payment/wallet"       options={SLIDE_RIGHT} />

      {/* Profile / account */}
      <Stack.Screen name="profile/edit"     options={SLIDE_BOTTOM} />
      <Stack.Screen name="tickets/index"    options={SLIDE_RIGHT} />
      <Stack.Screen name="perks/index"      options={SLIDE_RIGHT} />
      <Stack.Screen name="notifications/index" options={SLIDE_RIGHT} />

      {/* Help & legal */}
      <Stack.Screen name="help/index"       options={SLIDE_RIGHT} />
      <Stack.Screen name="legal/terms"      options={SLIDE_RIGHT} />
      <Stack.Screen name="legal/privacy"    options={SLIDE_RIGHT} />
      <Stack.Screen name="legal/cookies"    options={SLIDE_RIGHT} />
    </Stack>
  );
}

// ─── RootLayout ───────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    // Hide the splash screen once fonts are ready OR if loading failed,
    // so the app never gets stuck on a blank splash.
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Render nothing while fonts are loading — prevents a flash of unstyled text.
  // If font loading fails we still render (fonts will fall back to system fonts).
  if (!fontsLoaded && !fontError) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {/* style={StyleSheet.absoluteFill} ensures GestureHandlerRootView fills
            the entire screen, which is required by the library's documentation. */}
        <GestureHandlerRootView style={StyleSheet.absoluteFill}>
          <KeyboardProvider>
            <OnboardingProvider>
              <SavedProvider>
                <StatusBar style="auto" />
                <RootLayoutNav />
              </SavedProvider>
            </OnboardingProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}