import { toast } from '@/hooks/use-toast';
import { SocialAccount, SocialProfile } from '@/lib/types/social';

export async function fetchUserProfile(
  platform: SocialAccount['platform'],
  accessToken: string,
  tokenSecret?: string,
  refreshToken?: string,
  additionalData?: any,
  user?:any,
  token?:string
): Promise<SocialProfile> {
  console.log("🚀 ~ user:", user)
  const headers = {
    Authorization: `Bearer ${accessToken}`,
		// 'x-access-token': user.tdxToken,
		// 'x-access-user': user.tdxAccountId,
		// 'Content-Type': 'application/json', // 
  };

  try {
    let profileData: SocialProfile;

    switch (platform) {
      case 'twitter':
        const twitterResponse = await fetch('https://api.twitter.com/2/users/me', {
          headers,
        });
        const twitterData = await twitterResponse.json();
        
        // Call TDX API for Twitter connection
      let socialConnectTwitter = await fetch('https://stage-api.tdx.biz/game/api/v1/users/connect/social', {
          method: 'POST',
          headers: {
			Authorization: `Bearer ${user.token}`,
			"appid" :user.appId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            socialConnect: 'TWITTER',
            TwitterResp: {
              profile: {
                id: twitterData.data.id,
                username: twitterData.data.username,
                displayName: twitterData.data.name,
                photos: [{ value: twitterData.data.profile_image_url }],
                provider: 'twitter',
                _raw: JSON.stringify(twitterData),
                _json: twitterData
              },
              tokenSecret,
              token: accessToken
            }
          })
        });
		if (!socialConnectTwitter.ok) {
			const errorData = await socialConnectTwitter.json();
			throw new Error(
			  `Social connect API failed: ${errorData.message || 'Unknown error occurred'}`
			);
		  }
        profileData = {
          id: twitterData.data.id,
          username: twitterData.data.username,
          avatarUrl: twitterData.data.profile_image_url,
        };

        break;

			case 'youtube':
				const youtubeResponse = await fetch(
					'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
					{ headers }
				);
				const youtubeData = await youtubeResponse.json();
				console.log("🚀 ~ youtubeData:", youtubeData)
				const channel = youtubeData?.items?.[0]||youtubeData.items;

				// Get user profile from Google
				const googleResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
					headers,
				});
				const googleProfile = await googleResponse.json();

				// Call TDX API for YouTube/Google connection
				const socialConnectyoutube=await fetch('https://stage-api.tdx.biz/game/api/v1/users/connect/social', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${user.token}`,
						"appid" :user.appId,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						socialConnect: 'GOOGLE',
						YTResp: {
							profile: {
								id: googleProfile.id,
								displayName: googleProfile.name,
								name: {
									familyName: googleProfile.family_name,
									givenName: googleProfile.given_name
								},
								emails: [
									{
										value: googleProfile.email,
										verified: googleProfile.verified_email
									}
								],
								photos: [{ value: googleProfile.picture }],
								provider: 'google',
								_raw: JSON.stringify(googleProfile),
								_json: googleProfile
							},
							accessToken,
							refreshToken
						}
					})
				});
				if (!socialConnectyoutube.ok) {
					const errorData = await socialConnectyoutube.json();
					throw new Error(
					  `Social connect API failed: ${errorData.message || 'Unknown error occurred'}`
					);
				  }
				profileData = {
					id: channel.id,
					username: channel.snippet.title,
					avatarUrl: channel.snippet.thumbnails.default.url,
				};
				break;

			case 'discord':
				const discordResponse = await fetch('https://discord.com/api/users/@me', {
					headers,
				});
				const discordData = await discordResponse.json();

				// Get Discord guilds
				const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
					headers,
				});
				const guildsData = await guildsResponse.json();

				// Call TDX API for Discord connection
			 const socialConnectDiscord=	await fetch('https://stage-api.tdx.biz/game/api/v1/users/connect/social', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${user.token}`,
						'Content-Type': 'application/json',
						"appid" :user.appId,
					},
					body: JSON.stringify({
						socialConnect: 'DISCORD',
						DiscordResp: {
							profile: {
								id: discordData.id,
								username: discordData.username,
								email: discordData.email,
								verified: discordData.verified,
								provider: 'discord',
								accessToken,
								connections: [],
								guilds: guildsData,
								...discordData
							},
							accessToken,
							refreshToken
						}
					})
				});
				if (!socialConnectDiscord.ok) {
					const errorData = await socialConnectDiscord.json();
					throw new Error(
					  `Social connect API failed: ${errorData.message || 'Unknown error occurred'}`
					);
				  }
				profileData = {
					id: discordData.id,
					username: discordData.username,
					avatarUrl: `https://cdn.discordapp.com/avatars/${discordData.id}/${discordData.avatar}.png`,
				};
				break;

			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}

		return profileData;
	} catch (error) {
		toast({
			title: 'Connection Failed',
			//@ts-ignore
			description: error.message || 'Authentication failed',
			variant: 'destructive',
		});
		console.error(`Error fetching ${platform} profile:`, error);
		throw error;
	}
}