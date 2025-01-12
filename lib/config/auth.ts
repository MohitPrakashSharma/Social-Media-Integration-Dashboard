export const authConfig = {
	twitter: {
		clientId: process.env.NEXT_PUBLIC_TWITTER_CONSUMER_KEY || 'HaTwg5xZ3zxeFPdZJj1IaxX8s',
		clientSecret: process.env.TWITTER_CONSUMER_SECRET || 'hd5hFlypdBXOKw0wTx2fEQDDKLezIz8qYSabktlB6Ei6M4OOwN',
		redirectUri: 'https://social.tdx.biz/api/auth/twitter/callback',
		authUrl: 'https://api.twitter.com/oauth/authenticate',
		requestTokenUrl: 'https://api.twitter.com/oauth/request_token',
		tokenUrl: 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
		
		scope: ['tweet.read', 'users.read', 'offline.access'],
	},
	youtube: {
		clientId: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID || '',
		clientSecret: "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",
		redirectUri: "https://social.tdx.biz/api/auth/youtube/callback",
		authUrl: "https://accounts.google.com/o/oauth2/auth",
		tokenUrl: "https://oauth2.googleapis.com/token",
		scope: ["profile", "email", "https://www.googleapis.com/auth/youtube.readonly"],
	},
	discord: {
		clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '',
		clientSecret: process.env.NEXT_DISCORD_CLIENT_SECRET || 'BVCPexjONnvtMIdD0sMntDrAmRUyxwS_',
		redirectUri: 'https://social.tdx.biz/api/auth/discord/callback',
		authUrl: 'https://discord.com/api/oauth2/authorize',
		tokenUrl: 'https://discord.com/api/oauth2/token',
		scope: ['identify', 'email'],
	},
} as const;
