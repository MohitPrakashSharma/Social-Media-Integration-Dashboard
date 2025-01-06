'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SocialCard } from './SocialCard';
import { SocialAccount } from '@/lib/types/social';
import { authConfig } from '@/lib/config/auth';
import { useToast } from '@/hooks/use-toast';
import { getProfileFromCookies } from '@/utility';
import { fetchUserProfile } from '@/lib/utils/auth';

export function SocialDashboard() {
	const [accounts, setAccounts] = useState<Record<string, SocialAccount | null>>({
		twitter: null,
		youtube: null,
		discord: null,
	});

	const searchParams = useSearchParams();
	const { toast } = useToast();
	const platform = searchParams.get('platform');

	useEffect(() => {
		const success = searchParams.get('success');
		const error = searchParams.get('error');

		if (success && platform) {
			fetchProfile(platform as SocialAccount['platform']);
			toast({
				title: 'Connected Successfully',
				description: `Your ${platform} account has been connected.`,
			});
		} else if (error) {
			console.log("🚀 ~ useEffect ~ error:", error)
			toast({
				title: 'Connection Failed',
				description: error,
				variant: 'destructive',
			});
		}
	}, [searchParams, toast]);
	useEffect(() => {
		const code = searchParams.get('code')

		const error = searchParams.get('error');

		if (error || !code) {
			toast({
				title: 'Connection Failed',
				description: error,
				variant: 'destructive',
			});
		}
		if (code) {
			(async () => {
				try {
					const config = authConfig[platform as keyof typeof authConfig];
					const tokenResponse = await fetch(config.tokenUrl, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
						},
						body: new URLSearchParams({
							client_id: config.clientId,
							client_secret: "OCSPX-cxc964WymbCzKcqtiSfCtCM3TAxH",
							code,
							grant_type: 'authorization_code',
							redirect_uri: config.redirectUri,
						}),
					});

					if (!tokenResponse.ok) {
						throw new Error('Failed to exchange code for token');
					}

					const tokens = await tokenResponse.json();

					// Fetch user profile from the platform
					const userProfile = await fetchUserProfile(
						platform as keyof typeof authConfig,
						tokens.access_token
					);

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
					// Store tokens in localStorage
					localStorage.setItem(`${platform}_token`, tokens.access_token);

					// Store user profile in localStorage as a JSON string
					localStorage.setItem(`${platform}_profile`, JSON.stringify(userProfile));

					console.log("userProfile", userProfile)
					// return Response.redirect(
					//   `${process.env.NEXT_PUBLIC_APP_URL}?success=true&platform=${platform}`
					// );
				} catch (error) {
					console.error('Auth callback error:', error);
					// return Response.redirect(
					//   `${process.env.NEXT_PUBLIC_APP_URL}?error=Authentication failed`
					// );
				}
			})()

		}
	}, [searchParams])
	const fetchProfile = async (platform: SocialAccount['platform']) => {
		try {
			// const response = await fetch(`/api/auth/${platform}/profile`);
			// console.log("🚀 ~ fetchProfile ~ response:", response)
			// const profile = await response.json();
			// console.log("🚀 ~ fetchProfile ~ profile:", profile)
			const profile = await getProfileFromCookies(platform)
			if (profile) {
				setAccounts((prev) => ({
					...prev,
					[platform]: {
						...profile,
						platform,
						isConnected: true,
					},
				}));
			}
		} catch (error) {
			console.error('Failed to fetch profile:', error);
		}
	};

	const handleConnect = async (platform: SocialAccount['platform']) => {
		const config = authConfig[platform];
		const params = new URLSearchParams({
			client_id: config.clientId,
			redirect_uri: config.redirectUri,
			response_type: 'code',
			scope: config.scope.join(' '),
			state: platform,
		});

		window.location.href = `${config.authUrl}?${params.toString()}`;
	};

	const handleDisconnect = async (platform: SocialAccount['platform']) => {
		try {
			await fetch(`/api/auth/${platform}/disconnect`, { method: 'POST' });
			setAccounts((prev) => ({ ...prev, [platform]: null }));
		} catch (error) {
			console.error('Failed to disconnect:', error);
			throw error;
		}
	};

	// Fetch initial profiles on mount
	useEffect(() => {
		Object.keys(accounts).forEach((platform) => {
			fetchProfile(platform as SocialAccount['platform']);
		});
	}, []);

	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{Object.keys(accounts).map((platform) => (
				<SocialCard
					key={platform}
					platform={platform as SocialAccount['platform']}
					account={accounts[platform]}
					onConnect={() => handleConnect(platform as SocialAccount['platform'])}
					onDisconnect={() => handleDisconnect(platform as SocialAccount['platform'])}
				/>
			))}
		</div>
	);
}