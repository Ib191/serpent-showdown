import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/types';
import api from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    api.auth.getCurrentUser().then(response => {
      if (response.success && response.data) {
        setUser(response.data);
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.auth.login({ email, password });
    if (response.success && response.data) {
      setUser(response.data);
      return { success: true };
    }
    return { success: false, error: response.error };
  };

  const signup = async (email: string, password: string, username: string) => {
    const response = await api.auth.signup({ email, password, username });
    if (response.success && response.data) {
      setUser(response.data);
      return { success: true };
    }
    return { success: false, error: response.error };
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
