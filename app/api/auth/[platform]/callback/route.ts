import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { authConfig } from '@/lib/config/auth';
import { fetchUserProfile } from '@/lib/utils/auth';
import { exchangeCodeForToken } from '@/lib/utils/oauth';
import { COOKIE_OPTIONS } from '@/lib/utils/cookies';
import { createRedirectUrl } from '@/lib/utils/url';

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
    console.error('OAuth error:', { error, errorDescription, platform });
    return Response.redirect(
      createRedirectUrl({ 
        error: errorDescription || 'Authentication failed' 
      })
    );
  }

  try {
    console.log("🚀 ~ authConfig:", authConfig)

    if (!Object.keys(authConfig).includes(platform)) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const tokens = await exchangeCodeForToken(
      platform as keyof typeof authConfig,
      code
    );
    console.log("🚀 ~ tokens:", tokens)

    const userProfile = await fetchUserProfile(
      platform as keyof typeof authConfig,
      tokens.access_token
    );
    console.log("🚀 ~ userProfile:", userProfile)

    // Store tokens and profile in cookies
    const cookieStore = cookies();
    
    cookieStore.set(
      `${platform}_token`,
      tokens.access_token,
      {
        ...COOKIE_OPTIONS,
        // If token has expiration, use it for cookie
        ...(tokens.expires_in && {
          maxAge: tokens.expires_in
        })
      }
    );

    cookieStore.set(
      `${platform}_profile`,
      JSON.stringify(userProfile),
      COOKIE_OPTIONS
    );

    // Redirect back to the application with success status
    return Response.redirect(
      createRedirectUrl({
        success: true,
        platform
      })
    );

  } catch (error: any) {
    console.log("🚀 ~ error:", error)
    console.error('Auth callback error:', {
      platform,
      message: error.message,
      cause: error.cause
    });

    // return Response.redirect(
    //   createRedirectUrl({
    //     error: error.message || 'Authentication failed',
    //     platform
    //   })
    // );
  }
}