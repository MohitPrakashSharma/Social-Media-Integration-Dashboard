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

  // if (error || !code) {
  //   return Response.redirect(
  //     `${process.env.NEXT_PUBLIC_APP_URL}?error=Authentication failed`
  //   );
  // }

  try {
    // const config = authConfig[platform as keyof typeof authConfig];
    // const tokenResponse = await fetch(config.tokenUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: new URLSearchParams({
    //     client_id: config.clientId,
    //     client_secret: config.clientSecret,
    //     code,
    //     grant_type: 'authorization_code',
    //     redirect_uri: config.redirectUri,
    //   }),
    // });

    // if (!tokenResponse.ok) {
    //   throw new Error('Failed to exchange code for token');
    // }

    // const tokens = await tokenResponse.json();
    
    // // Fetch user profile from the platform
    // const userProfile = await fetchUserProfile(
    //   platform as keyof typeof authConfig,
    //   tokens.access_token
    // );

    // Store tokens and profile in cookies (in production, use a secure database instead)
    // const cookieStore = cookies();
    // cookieStore.set(`${platform}_token`, tokens.access_token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   maxAge: 60 * 60 * 24 * 7, // 1 week
    // });

    // cookieStore.set(`${platform}_profile`, JSON.stringify(userProfile), {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   maxAge: 60 * 60 * 24 * 7, // 1 week
    // });

    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?code=${code}&error=${error}&platform=${platform}`
    );
  } catch (error) {
    console.error('Auth callback error:', error);
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?error=Authentication failed`
    );
  }
}