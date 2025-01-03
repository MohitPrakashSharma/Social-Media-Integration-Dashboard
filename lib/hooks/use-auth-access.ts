'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useSearchParams } from 'next/navigation';
import { validateAuthAccess } from '@/lib/utils/auth-validator';

interface AuthAccessState {
  isValidating: boolean;
  error: string | null;
  hasAccess: boolean;
}

export function useAuthAccess() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [state, setState] = useState<AuthAccessState>({
    isValidating: true,
    error: null,
    hasAccess: false,
  });

  useEffect(() => {
    const checkAccess = () => {
      const userParam = searchParams.get('user');
      const { hasAccess, error } = validateAuthAccess(!!user, !!userParam);

      setState({
        isValidating: false,
        error,
        hasAccess,
      });
    };

    checkAccess();
  }, [user, searchParams]);

  return state;
}