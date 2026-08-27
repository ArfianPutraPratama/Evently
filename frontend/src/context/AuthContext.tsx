import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole | 'guest';
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  quickSwitchRole: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous initialization from localStorage so there is ZERO delay or logout flash on refresh
  const [user, setUser] = useState<User | null>(() => api.getUser());
  const [isLoading, setIsLoading] = useState<boolean>(!api.getUser());

  const refreshUser = async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      api.saveUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      if (data?.user) {
        setUser(data.user);
        api.saveUser(data.user);
      }
    } catch (err: any) {
      // Only clear if status is 401 Unauthorized (token revoked or expired)
      if (err?.status === 401) {
        api.setToken(null);
        api.saveUser(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, pass);
      setUser(data.user);
      api.saveUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } finally {
      api.setToken(null);
      api.saveUser(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const quickSwitchRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      let email = 'peserta@surabayadev.org';
      if (targetRole === 'admin') email = 'admin@surabayadev.org';
      if (targetRole === 'committee') email = 'panitia@surabayadev.org';

      const data = await api.login(email, 'password');
      setUser(data.user);
      api.saveUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'guest',
        isLoading,
        login,
        logout,
        quickSwitchRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
