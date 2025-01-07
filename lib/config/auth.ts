export const authConfig = {
	twitter: {
		clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '',
		clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
		redirectUri: 'https://social.tdx.biz/api/auth/twitter/callback',
		authUrl: 'https://twitter.com/i/oauth2/authorize',
		tokenUrl: 'https://api.twitter.com/2/oauth2/token',
		scope: ['tweet.read', 'users.read'],
	},
	youtube: {
		clientId: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID || '',
		clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
		redirectUri: 'https://social.tdx.biz/api/auth/youtube/callback',
		authUrl: 'https://www.googleapis.com/oauth2/v4/token ',
		tokenUrl: 'https://oauth2.googleapis.com/token',
		scope: ["profile", "email", 'https://www.googleapis.com/auth/youtube.readonly'],
	},
	discord: {
		clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '',
		clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
		redirectUri: 'https://social.tdx.biz/api/auth/discord/callback',
		authUrl: 'https://discord.com/api/oauth2/authorize',
		tokenUrl: 'https://discord.com/api/oauth2/token',
		scope: ['identify', 'email'],
	},
} as const;
