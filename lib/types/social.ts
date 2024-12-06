export interface SocialAccount {
  id: string;
  platform: 'twitter' | 'youtube' | 'discord';
  username: string;
  avatarUrl?: string;
  isConnected: boolean;
}

export interface AuthState {
  loading: boolean;
  error: string | null;
}

export interface SocialAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authUrl: string;
  tokenUrl: string;
  scope: string[];
}