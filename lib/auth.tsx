import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthUser {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  user: AuthUser | null;
  authToken: string | null;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = '@culturepass_auth_user';
const AUTH_TOKEN_KEY = '@culturepass_auth_token';

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userId: null,
  user: null,
  authToken: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(AUTH_STORAGE_KEY),
      AsyncStorage.getItem(AUTH_TOKEN_KEY),
    ])
      .then(([storedUser, storedToken]) => {
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            console.warn("Failed to parse stored auth user — clearing cached session.");
            AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
        if (storedToken) {
          setAuthToken(storedToken);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((u: AuthUser, token: string) => {
    setUser(u);
    setAuthToken(token);
    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u)).catch(() => {});
    AsyncStorage.setItem(AUTH_TOKEN_KEY, token).catch(() => {});
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthToken(null);
    AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => {});
    AsyncStorage.removeItem(AUTH_TOKEN_KEY).catch(() => {});
  }, []);

  const value = useMemo(() => ({
    isAuthenticated: !!user,
    userId: user?.id ?? null,
    user,
    authToken,
    isLoading,
    login,
    logout,
  }), [user, authToken, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
