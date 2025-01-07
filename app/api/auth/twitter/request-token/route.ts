import { authConfig } from '@/lib/config/auth';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

export async function GET() {
  try {
    const oauth = new OAuth({
      consumer: {
        key: authConfig.twitter.clientId,
        secret: authConfig.twitter.clientSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64');
      },
    });

    const requestData = {
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST',
    };

    const headers = oauth.toHeader(oauth.authorize(requestData));

    const response = await fetch(requestData.url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get request token');
    }

    const data = await response.text();
    const parsed = new URLSearchParams(data);
    
    return Response.json({
      oauth_token: parsed.get('oauth_token'),
      oauth_token_secret: parsed.get('oauth_token_secret'),
    });
  } catch (error) {
    console.error('Request token error:', error);
    return Response.json(
      { error: 'Failed to get request token' },
      { status: 500 }
    );
  }
}