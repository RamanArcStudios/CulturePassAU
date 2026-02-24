import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/lib/auth";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { SavedProvider } from "@/contexts/SavedContext";
import { ContactsProvider } from "@/contexts/ContactsContext";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

// Prevent splash auto-hide safely
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackTitle: "Back",
        headerShadowVisible: false,
      }}
    >
      {/* Core Navigation Groups */}
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />

      {/* Core Entity Screens */}
      <Stack.Screen name="event/[id]" />
      <Stack.Screen name="community/[id]" />
      <Stack.Screen name="business/[id]" />
      <Stack.Screen name="artist/[id]" />
      <Stack.Screen name="venue/[id]" />

      {/* Profile */}
      <Stack.Screen name="profile/[id]" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="profile/public" />
      <Stack.Screen name="profile/qr" />

      {/* Super App Modules */}
      <Stack.Screen name="movies/index" />
      <Stack.Screen name="movies/[id]" />
      <Stack.Screen name="restaurants/index" />
      <Stack.Screen name="restaurants/[id]" />
      <Stack.Screen name="activities/index" />
      <Stack.Screen name="activities/[id]" />
      <Stack.Screen name="shopping/index" />
      <Stack.Screen name="shopping/[id]" />

      {/* Payments */}
      <Stack.Screen name="payment/methods" />
      <Stack.Screen name="payment/transactions" />
      <Stack.Screen name="payment/wallet" />

      {/* Tickets / Perks / Notifications */}
      <Stack.Screen name="tickets/index" />
      <Stack.Screen name="perks/index" />
      <Stack.Screen name="notifications/index" />

      {/* Contacts & Scanner */}
      <Stack.Screen name="contacts/index" />
      <Stack.Screen name="contacts/[cpid]" />
      <Stack.Screen name="scanner" />

      {/* Help & Legal */}
      <Stack.Screen name="help/index" />
      <Stack.Screen name="legal/terms" />
      <Stack.Screen name="legal/privacy" />
      <Stack.Screen name="legal/cookies" />
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

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <OnboardingProvider>
              <SavedProvider>
                <ContactsProvider>
                  <GestureHandlerRootView
                    style={{ flex: 1 }}
                    onLayout={onLayoutRootView}
                  >
                    <KeyboardProvider>
                      <RootLayoutNav />
                    </KeyboardProvider>
                  </GestureHandlerRootView>
                </ContactsProvider>
              </SavedProvider>
            </OnboardingProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}