'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { TelegramUser } from '@/lib/types/auth';
import { SocialDashboard } from '@/components/social/SocialDashboard';
import { Shield } from 'lucide-react';

export default function Home() {
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateAccess = async () => {
      const userParam = searchParams.get('user');

      if (!userParam && !user) {
        setError('This URL is not publicly accessible. Please log in to access.');
        setIsValidating(false);
        return;
      }

      if (userParam) {
        try {
          const jsonString = atob(userParam);
          const telegramUser: TelegramUser = JSON.parse(jsonString);
          
          // Validate required fields
          if (!telegramUser.telegramId || !telegramUser.userName || !telegramUser.name) {
            throw new Error('Invalid user data');
          }

          await login(telegramUser);
        } catch (error) {
          console.error('Access validation error:', error);
          setError('Invalid access token. Please use a valid login link.');
        }
      }
      
      setIsValidating(false);
    };

    validateAccess();
  }, [searchParams, login, user]);

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Validating access...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Shield className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-center mb-2">Access Restricted</h1>
        <p className="text-center text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Welcome, {user.name}!</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Level {user.level} • {user.points} Points
        </p>
      </div>
      <SocialDashboard />
    </main>
  );
}