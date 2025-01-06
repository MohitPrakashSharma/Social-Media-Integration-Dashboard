import { NextRequest } from 'next/server';
import { authConfig } from '@/lib/config/auth';
import { fetchUserProfile } from '@/lib/utils/auth';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const { platform } = params;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error || !code) {
    console.error('Auth error:', error, errorDescription);
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?error=${encodeURIComponent(errorDescription || 'Authentication failed')}`
    );
  }

  try {
    const config = authConfig[platform as keyof typeof authConfig];
    
    // Prepare token request body based on platform
    const tokenBody = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    });

    // Add platform-specific parameters
    if (platform === 'discord') {
      tokenBody.append('scope', config.scope.join(' '));
    }

    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: tokenBody,
    });
    console.log("🚀 ~ tokenResponse:", tokenResponse)

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange error:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData,
        platform,
      });
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
    }

    const tokens = await tokenResponse.json();
    
    // Fetch user profile from the platform
    const userProfile = await fetchUserProfile(
      platform as keyof typeof authConfig,
      tokens.access_token
    );

    // Store tokens and profile in cookies
    const cookieStore = cookies(); 
    cookieStore.set(`${platform}_token`, tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    cookieStore.set(`${platform}_profile`, JSON.stringify(userProfile), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?success=true&platform=${platform}`
    );
  } catch (error: any) {
    console.error('Auth callback error:', error);
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?error=${encodeURIComponent(error.message || 'Authentication failed')}`
    );
  }
}