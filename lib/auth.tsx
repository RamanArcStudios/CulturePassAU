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
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = '@culturepass_auth_user';

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userId: null,
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch (error) {
            console.error("Failed to parse stored user, clearing cache.");
            AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((u: AuthUser) => {
    setUser(u);
    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u)).catch(() => {});
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo(() => ({
    isAuthenticated: !!user,
    userId: user?.id ?? null,
    user,
    isLoading,
    login,
    logout,
  }), [user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
