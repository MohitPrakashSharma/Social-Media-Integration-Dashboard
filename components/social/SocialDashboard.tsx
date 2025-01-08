'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SocialCard } from './SocialCard';
import { SocialAccount } from '@/lib/types/social';
import { authConfig } from '@/lib/config/auth';
import { useToast } from '@/hooks/use-toast';
import { getProfileFromCookies } from '@/utility';
import { fetchUserProfile } from '@/lib/utils/auth';
import { useAuth } from '@/lib/context/auth-context';

export function SocialDashboard() {
	const [accounts, setAccounts] = useState<Record<string, SocialAccount | null>>({
		twitter: null,
		youtube: null,
		discord: null,
	});

	const searchParams = useSearchParams();
	const { toast } = useToast();
	const platform = searchParams.get('platform');
	const code = searchParams.get('code');
	const {  user } = useAuth();

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
			toast({
				title: 'Connection Failed',
				description: error,
				variant: 'destructive',
			});
		}
	}, [searchParams, toast, platform]);

	useEffect(() => {
		if (code && platform) {
			handleAuth();
		}
	}, [code, platform]);

	const fetchProfile = async (platform: SocialAccount['platform']) => {
		try {
			const profile = await getProfileFromCookies(platform);
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

	const handleAuth = async () => {
		if (!platform || !code) return;

		try {
			const config = authConfig[platform as keyof typeof authConfig];
			const tokenResponse = await fetch(config.tokenUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					client_id: config.clientId,
					client_secret: config.clientSecret,
					code,
					grant_type: 'authorization_code',
					redirect_uri: config.redirectUri,
				}),
			});

			if (!tokenResponse.ok) {
				throw new Error('Failed to exchange code for token');
			}

			const tokens = await tokenResponse.json();

			// Fetch user profile and connect to TDX API
			const userProfile = await fetchUserProfile(
				platform as SocialAccount['platform'],
				tokens.access_token,
				tokens.token_secret,
				tokens.refresh_token,
				tokens,
				user
			);

			// Create full social account object
			const socialAccount: SocialAccount = {
				...userProfile,
				platform: platform as SocialAccount['platform'],
				isConnected: true,
			};

			// Store tokens and profile in localStorage
			localStorage.setItem(`${platform}_token`, tokens.access_token);
			localStorage.setItem(`${platform}_profile`, JSON.stringify(socialAccount));

			// Update accounts state
			setAccounts(prev => ({
				...prev,
				[platform]: socialAccount,
			}));

			toast({
				title: 'Connected Successfully',
				description: `Your ${platform} account has been connected.`,
			});
		} catch (error: any) {
			console.error('Auth callback error:', error);
			toast({
				title: 'Connection Failed',
				description: error.message || 'Authentication failed',
				variant: 'destructive',
			});
		}
	};

	const handleConnect = async (platform: SocialAccount['platform']) => {
		try {
			if (platform === 'twitter') {
				const response = await fetch('/api/auth/twitter/request-token');
				const data = await response.json();

				if (data.error) {
					throw new Error(data.error);
				}

				window.location.href = `${authConfig.twitter.authUrl}?oauth_token=${data.oauth_token}`;
				return;
			}

			// For other platforms
			const config = authConfig[platform];
			const params = new URLSearchParams({
				client_id: config.clientId,
				redirect_uri: config.redirectUri,
				response_type: 'code',
				scope: config.scope.join(' '),
				state: platform,
			});

			window.location.href = `${config.authUrl}?${params.toString()}`;
		} catch (error: any) {
			toast({
				title: 'Connection Failed',
				description: error.message || 'Failed to connect to platform',
				variant: 'destructive',
			});
		}
	};

	const handleDisconnect = async (platform: SocialAccount['platform']) => {
		try {
			await fetch(`/api/auth/${platform}/disconnect`, { method: 'POST' });
			setAccounts((prev) => ({ ...prev, [platform]: null }));
			localStorage.removeItem(`${platform}_token`);
			localStorage.removeItem(`${platform}_profile`);
			toast({
				title: 'Disconnected',
				description: `Your ${platform} account has been disconnected.`,
			});
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