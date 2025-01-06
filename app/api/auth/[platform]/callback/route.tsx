import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { authConfig } from '@/lib/config/auth';
import { exchangeCodeForToken } from '@/lib/utils/oauth';
import { fetchUserProfile } from '@/lib/utils/auth';
import { createRedirectUrl } from '@/lib/utils/url';

const OAuthCallback = ({ platform }: { platform: string }) => {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error || !code) {
        console.error('OAuth error:', { error, errorDescription, platform });
        window.location.href = createRedirectUrl({
          error: errorDescription || 'Authentication failed',
        });
        return;
      }

      try {
        if (!Object.keys(authConfig).includes(platform)) {
          throw new Error(`Unsupported platform: ${platform}`);
        }

        const tokens = await exchangeCodeForToken(
          platform as keyof typeof authConfig,
          code
        );
        console.log('Tokens:', tokens);

        const userProfile = await fetchUserProfile(
          platform as keyof typeof authConfig,
          tokens.access_token
        );
        console.log('UserProfile:', userProfile);

        // Store tokens and profile in cookies using JavaScript
        document.cookie = `${platform}_token=${tokens.access_token}; path=/; secure; ${
          tokens.expires_in ? `max-age=${tokens.expires_in}` : ''
        }`;
        document.cookie = `${platform}_profile=${encodeURIComponent(
          JSON.stringify(userProfile)
        )}; path=/; secure;`;

        // Redirect back to the application with success status
        window.location.href = createRedirectUrl({
          success: true,
          platform,
        });
      } catch (error: any) {
        console.error('Auth callback error:', {
          platform,
          message: error.message,
          cause: error.cause,
        });

        window.location.href = createRedirectUrl({
          error: error.message || 'Authentication failed',
          platform,
        });
      }
    };

    handleAuth();
  }, [platform, searchParams]);

  return <div>Authenticating...</div>;
};

export default OAuthCallback;
