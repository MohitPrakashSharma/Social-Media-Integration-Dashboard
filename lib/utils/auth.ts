import { SocialAccount, SocialAuthConfig } from '@/lib/types/social';

export async function fetchUserProfile(
	platform: SocialAccount['platform'],
	accessToken: string
): Promise<Partial<SocialAccount>> {
	const headers = {
		Authorization: `Bearer ${accessToken}`,
	};

	switch (platform) {
		case 'twitter':
			const twitterResponse = await fetch('https://api.twitter.com/2/users/me', {
				headers,
			});
			const twitterData = await twitterResponse.json();
			return {
				id: twitterData.data.id,
				username: twitterData.data.username,
				avatarUrl: twitterData.data.profile_image_url,
			};

		case 'youtube':
			const youtubeResponse = await fetch(
				'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
				{ headers }
			);
			const youtubeData = await youtubeResponse.json();
			const channel = youtubeData.items[0];
			return {
				id: channel.id,
				username: channel.snippet.title,
				avatarUrl: channel.snippet.thumbnails.default.url,
			};

		case 'discord':
			const discordResponse = await fetch('https://discord.com/api/users/@me', {
				headers,
			});
			const discordData = await discordResponse.json();
			return {
				id: discordData.id,
				username: discordData.username,
				avatarUrl: `https://cdn.discordapp.com/avatars/${discordData.id}/${discordData.avatar}.png`,
			};

		default:
			throw new Error(`Unsupported platform: ${platform}`);
	}
}