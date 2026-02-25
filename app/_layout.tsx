import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect } from 'react';
import { Platform, View, StyleSheet, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { queryClient } from '@/lib/query-client';
import { AuthProvider } from '@/lib/auth';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { SavedProvider } from '@/contexts/SavedContext';
import { ContactsProvider } from '@/contexts/ContactsContext';

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

// Prevent splash auto-hide safely
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackTitle: 'Back',
        headerShadowVisible: false,
        animation: 'default',
        gestureEnabled: true,
      }}
    >
      {/* Onboarding */}
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />

      {/* Main tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Entities */}
      <Stack.Screen name="event/[id]" />
      <Stack.Screen name="community/[id]" />
      <Stack.Screen name="business/[id]" />
      <Stack.Screen name="artist/[id]" />
      <Stack.Screen name="venue/[id]" />
      <Stack.Screen name="user/[id]" />

      {/* Profile */}
      <Stack.Screen name="profile/[id]" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="profile/public" />
      <Stack.Screen name="profile/qr" />

      {/* Super app sections */}
      <Stack.Screen name="movies/index" />
      <Stack.Screen name="movies/[id]" />
      <Stack.Screen name="restaurants/index" />
      <Stack.Screen name="restaurants/[id]" />
      <Stack.Screen name="activities/index" />
      <Stack.Screen name="activities/[id]" />
      <Stack.Screen name="shopping/index" />
      <Stack.Screen name="shopping/[id]" />
      <Stack.Screen name="communities/index" />

      {/* Payments */}
      <Stack.Screen name="payment/methods" />
      <Stack.Screen name="payment/transactions" />
      <Stack.Screen name="payment/wallet" />

      {/* Tickets & Perks */}
      <Stack.Screen name="tickets/index" />
      <Stack.Screen name="tickets/[id]" />
      <Stack.Screen name="perks/index" />
      <Stack.Screen name="perks/[id]" />
      <Stack.Screen name="notifications/index" />

      {/* Social */}
      <Stack.Screen name="contacts/index" />
      <Stack.Screen name="contacts/[cpid]" />
      <Stack.Screen name="scanner" />

      {/* Discovery */}
      <Stack.Screen name="search/index" />
      <Stack.Screen name="saved/index" />
      <Stack.Screen name="submit/index" />
      <Stack.Screen name="allevents" />
      <Stack.Screen name="map" />
      <Stack.Screen name="membership/upgrade" />

      {/* Settings */}
      <Stack.Screen name="settings/about" />
      <Stack.Screen name="settings/help" />
      <Stack.Screen name="settings/notifications" />
      <Stack.Screen name="settings/privacy" />

      {/* Help & Legal */}
      <Stack.Screen name="help/index" />
      <Stack.Screen name="legal/terms" />
      <Stack.Screen name="legal/privacy" />
      <Stack.Screen name="legal/cookies" />
      <Stack.Screen name="legal/guidelines" />
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
    if (fontsLoaded || !__DEV__) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Hide splash on mount if fonts already loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded && !__DEV__) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
      </View>
    );
  }

  const isWeb = Platform.OS === 'web';

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <OnboardingProvider>
              <SavedProvider>
                <ContactsProvider>
                  <GestureHandlerRootView
                    style={styles.gestureContainer}
                    onLayout={onLayoutRootView}
                  >
                    {isWeb ? (
                      <View style={webStyles.outerContainer}>
                        <View style={webStyles.innerContainer}>
                          <KeyboardProvider>
                            <StatusBar
                              barStyle="dark-content"
                              style={styles.statusBar}
                            />
                            <RootLayoutNav />
                          </KeyboardProvider>
                        </View>
                      </View>
                    ) : (
                      <>
                        <StatusBar barStyle="dark-content" />
                        <KeyboardProvider>
                          <RootLayoutNav />
                        </KeyboardProvider>
                      </>
                    )}
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureContainer: {
    flex: 1,
  },
  statusBar: {
    style: 'dark',
  },
});

const webStyles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#F2F2F7',
    overflow: 'hidden',
    ...(Platform.select({
      web: {
        boxShadow: '0 0 40px rgba(0,0,0,0.3)',
      },
    }) as any),
  },
});
