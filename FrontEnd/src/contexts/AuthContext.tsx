import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { api } from "@/lib/api";

export function createAuthProvider() {
  return function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
      const storedUser = localStorage.getItem('expense_tracker_user');
      return storedUser ? JSON.parse(storedUser) : null;
    });
    const [isLoading, setIsLoading] = useState(false);

    const login = async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await api.login(email, password);
        const nextUser: User = {
          id: res.user._id,
          email: res.user.email,
          name: res.user.fullname,
        };
        setUser(nextUser);
        localStorage.setItem('expense_tracker_user', JSON.stringify(nextUser));
      } finally {
        setIsLoading(false);
      }
    };

    const signup = async (email: string, password: string, name: string) => {
      setIsLoading(true);
      try {
        await api.register(name, email, password);
        const res = await api.login(email, password);
        const nextUser: User = {
          id: res.user._id,
          email: res.user.email,
          name: res.user.fullname,
        };
        setUser(nextUser);
        localStorage.setItem('expense_tracker_user', JSON.stringify(nextUser));
      } finally {
        setIsLoading(false);
      }
    };

    const logout = () => {
      api.logout().catch(() => {});
      setUser(null);
      localStorage.removeItem('expense_tracker_user');
    };

    return (
      <AuthContext.Provider value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}>
        {children}
      </AuthContext.Provider>
    );
  };
}
