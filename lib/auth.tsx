import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  subscriptionTier?: 'free' | 'plus' | 'elite';
  country?: string;
  city?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (session: AuthSession) => Promise<void>;
  logout: () => Promise<void>;
}

const AUTH_STORAGE_KEY = '@culturepass_auth_session';

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userId: null,
  user: null,
  accessToken: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

async function getStoredSession(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(AUTH_STORAGE_KEY);
  }

  return SecureStore.getItemAsync(AUTH_STORAGE_KEY);
}

async function persistSession(session: AuthSession): Promise<void> {
  const serialized = JSON.stringify(session);

  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, serialized);
    return;
  }

  await SecureStore.setItemAsync(AUTH_STORAGE_KEY, serialized);
}

async function clearSession(): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
}

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = await getStoredSession();
        if (stored) {
          setSession(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to restore session from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = useCallback(async (newSession: AuthSession) => {
    setSession(newSession);
    try {
      await persistSession(newSession);
    } catch (error) {
      console.error('Failed to persist session to storage:', error);
      setSession(null);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setSession(null);
    try {
      await clearSession();
    } catch (error) {
      console.error('Failed to remove session from storage:', error);
    }
  }, []);

  const value = useMemo(() => ({
    isAuthenticated: !!session,
    userId: session?.user.id ?? null,
    user: session?.user ?? null,
    accessToken: session?.accessToken ?? null,
    isLoading,
    login,
    logout,
  }), [session, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
