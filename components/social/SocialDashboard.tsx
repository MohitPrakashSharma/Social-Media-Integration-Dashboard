'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SocialCard } from './SocialCard';
import { SocialAccount } from '@/lib/types/social';
import { authConfig } from '@/lib/config/auth';
import { useToast } from '@/hooks/use-toast';

export function SocialDashboard() {
	const [accounts, setAccounts] = useState<Record<string, SocialAccount | null>>({
		twitter: null,
		youtube: null,
		discord: null,
	});
	const searchParams = useSearchParams();
	const { toast } = useToast();

	useEffect(() => {
		const success = searchParams.get('success');
		console.log("🚀 ~ useEffect ~ success:", success)
		const error = searchParams.get('error');
		console.log("🚀 ~ useEffect ~ error:", error)
		const platform = searchParams.get('platform');
		console.log("🚀 ~ useEffect ~ platform:", platform)

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

	const fetchProfile = async (platform: SocialAccount['platform']) => {
		try {
			const response = await fetch(`/api/auth/${platform}/profile`);
			const profile = await response.json();

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