'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { SocialAccount, AuthState } from '@/lib/types/social';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface SocialCardProps {
  platform: SocialAccount['platform'];
  account: SocialAccount | null;
  loading?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function SocialCard({ platform, account, loading = false, onConnect, onDisconnect }: SocialCardProps) {
  const [authState, setAuthState] = useState<AuthState>({ loading: false, error: null });
  const { toast } = useToast();

  const handleConnect = async () => {
    setAuthState({ loading: true, error: null });
    try {
      await onConnect();
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to ' + platform,
        variant: 'destructive',
      });
      setAuthState({ loading: false, error: 'Connection failed' });
    }
  };

  const handleDisconnect = async () => {
    setAuthState({ loading: true, error: null });
    try {
      await onDisconnect();
    } catch (error) {
      setAuthState({ loading: false, error: 'Disconnection failed' });
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold capitalize">{platform}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold capitalize">{platform}</CardTitle>
        {account && account.avatarUrl && (
          <div className="relative h-9 w-9 overflow-hidden rounded-full">
            <Image
              src={account.avatarUrl}
              alt={`${account.username}'s avatar`}
              width={36}
              height={36}
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        {account && !account.avatarUrl && (
          <Avatar className="h-9 w-9">
            <AvatarFallback>{account.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {account ? (
            <>
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm font-medium">Connected as:</p>
                  <p className="text-sm text-muted-foreground">{account.username}</p>
                </div>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDisconnect}
                disabled={authState.loading}
              >
                {authState.loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Disconnect'
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleConnect}
              disabled={authState.loading}
            >
              {authState.loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Connect'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}