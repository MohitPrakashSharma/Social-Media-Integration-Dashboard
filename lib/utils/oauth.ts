import { authConfig } from '@/lib/config/auth';
import { SocialAccount } from '@/lib/types/social';

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
  
  // Base token request parameters
  const tokenBody = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri,
  });

  // Platform-specific adjustments
  switch (platform) {
    case 'discord':
      tokenBody.append('scope', config.scope.join(' '));
      break;
    case 'twitter':
      // Twitter requires code_verifier for PKCE
      tokenBody.append('code_verifier', 'challenge');
      break;
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: tokenBody,
  });

  if (!response.ok) {
    const errorData = await response.text();
    const error = new Error(`Token exchange failed: ${response.statusText}`);
    error.cause = {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
      platform,
    };
    throw error;
  }

  return response.json();
}