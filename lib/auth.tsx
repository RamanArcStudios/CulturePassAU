import React, { createContext, useContext, useState, useMemo } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  login: (id: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userId: null,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  const value = useMemo(() => ({
    isAuthenticated: !!userId,
    userId,
    login: (id: string) => setUserId(id),
    logout: () => setUserId(null),
  }), [userId]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
