import { authConfig } from '@/lib/config/auth';
import oauthConfigs from './oauth-config';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export async function exchangeCodeForToken(
  platform: keyof typeof authConfig,
  code: string
): Promise<TokenResponse> {
  const config = authConfig[platform];
  const oauthConfig = oauthConfigs[platform];

  try {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: oauthConfig.getTokenRequestHeaders(),
      body: oauthConfig.getTokenRequestParams(code),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Token exchange failed: ${response.statusText}`, {
        cause: {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          platform,
        },
      });
    }

    return response.json();
  } catch (error: any) {
    console.error('Token exchange error:', {
      platform,
      message: error.message,
      cause: error.cause,
    });
    throw error;
  }
}