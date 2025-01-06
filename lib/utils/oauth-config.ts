import { authConfig } from '@/lib/config/auth';

export interface OAuthConfig {
  getTokenRequestParams: (code: string) => URLSearchParams;
  getTokenRequestHeaders: () => Record<string, string>;
}

const oauthConfigs: Record<keyof typeof authConfig, OAuthConfig> = {
  twitter: {
    getTokenRequestParams: (code: string) => {
      const config = authConfig.twitter;
      const params = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        code_verifier: 'challenge', // In production, this should be properly generated and stored
      });
      return params;
    },
    getTokenRequestHeaders: () => ({
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: `Basic ${Buffer.from(
        `${authConfig.twitter.clientId}:${authConfig.twitter.clientSecret}`
      ).toString('base64')}`,
    }),
  },
  youtube: {
    getTokenRequestParams: (code: string) => {
      const config = authConfig.youtube;
      return new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
      });
    },
    getTokenRequestHeaders: () => ({
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    }),
  },
  discord: {
    getTokenRequestParams: (code: string) => {
      const config = authConfig.discord;
      return new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
        scope: config.scope.join(' '),
      });
    },
    getTokenRequestHeaders: () => ({
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    }),
  },
};

export default oauthConfigs;