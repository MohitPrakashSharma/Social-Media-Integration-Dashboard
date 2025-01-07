'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SocialCard } from './SocialCard';
import { SocialAccount } from '@/lib/types/social';
import { authConfig } from '@/lib/config/auth';
import { useToast } from '@/hooks/use-toast';
import { getProfileFromCookies } from '@/utility';
import { fetchUserProfile } from '@/lib/utils/auth';

export function SocialDashboard() {
  const [accounts, setAccounts] = useState<Record<string, SocialAccount | null>>({
    twitter: null,
    youtube: null,
    discord: null,
  });

  const searchParams = useSearchParams();
  const { toast } = useToast();
  const platform = searchParams.get('platform');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error || !code || !platform) {
      if (error) {
        toast({
          title: 'Connection Failed',
          description: error,
          variant: 'destructive',
        });
      }
      return;
    }

    const handleAuth = async () => {
      try {
        const config = authConfig[platform as keyof typeof authConfig];
        const tokenResponse = await fetch(config.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: config.redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const tokens = await tokenResponse.json();
        
        // Fetch user profile and connect to TDX API
        const userProfile = await fetchUserProfile(
          platform as keyof typeof authConfig,
          tokens.access_token,
          tokens.token_secret, // For Twitter
          tokens.refresh_token, // For YouTube and Discord
          tokens // Additional token data
        );

        // Store tokens and profile in localStorage
        localStorage.setItem(`${platform}_token`, tokens.access_token);
        localStorage.setItem(`${platform}_profile`, JSON.stringify(userProfile));

        // Update accounts state
        setAccounts(prev => ({
          ...prev,
          [platform]: {
            ...userProfile,
            platform: platform as SocialAccount['platform'],
            isConnected: true,
          },
        }));

        toast({
          title: 'Connected Successfully',
          description: `Your ${platform} account has been connected.`,
        });
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast({
          title: 'Connection Failed',
          description: error.message || 'Authentication failed',
          variant: 'destructive',
        });
      }
    };

    handleAuth();
  }, [searchParams, toast]);

  const handleConnect = async (platform: SocialAccount['platform']) => {
    const config = authConfig[platform];
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scope.join(' '),
      state: platform,
    });

    window.location.href = `${config.authUrl}?${params.toString()}`;
  };

  const handleDisconnect = async (platform: SocialAccount['platform']) => {
    try {
      await fetch(`/api/auth/${platform}/disconnect`, { method: 'POST' });
      localStorage.removeItem(`${platform}_token`);
      localStorage.removeItem(`${platform}_profile`);
      setAccounts(prev => ({ ...prev, [platform]: null }));
      
      toast({
        title: 'Disconnected Successfully',
        description: `Your ${platform} account has been disconnected.`,
      });
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast({
        title: 'Disconnection Failed',
        description: `Failed to disconnect ${platform} account.`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Fetch initial profiles on mount
  useEffect(() => {
    Object.keys(accounts).forEach((platform) => {
      const profile = localStorage.getItem(`${platform}_profile`);
      if (profile) {
        setAccounts(prev => ({
          ...prev,
          [platform]: {
            ...JSON.parse(profile),
            platform: platform as SocialAccount['platform'],
            isConnected: true,
          },
        }));
      }
    });
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Object.keys(accounts).map((platform) => (
        <SocialCard
          key={platform}
          platform={platform as SocialAccount['platform']}
          account={accounts[platform]}
          onConnect={() => handleConnect(platform as SocialAccount['platform'])}
          onDisconnect={() => handleDisconnect(platform as SocialAccount['platform'])}
        />
      ))}
    </div>
  );
}