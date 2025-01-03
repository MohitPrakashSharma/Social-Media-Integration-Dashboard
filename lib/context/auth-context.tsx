'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, TelegramUser } from '@/lib/types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (telegramUser: TelegramUser) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const login = async (telegramUser: TelegramUser) => {
    try {
      const response = await fetch('https://stage-api.tdx.biz/game/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(telegramUser),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.message);
      }

      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}