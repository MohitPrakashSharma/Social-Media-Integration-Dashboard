import { authConfig } from '@/lib/config/auth';
import oauthConfigs from './oauth-config';

interface TokenResponse {
	access_token: string;
	token_type: string;
	expires_in?: number;
	refresh_token?: string;
}

export async function exchangeCodeForToken(
	platform: keyof typeof authConfig,
	code: string
): Promise<TokenResponse> {
	const config = authConfig[platform];
	console.log("🚀 ~ config:", config)
	const oauthConfig = oauthConfigs[platform];
	console.log("🚀 ~ oauthConfig:", oauthConfig)

	try {
		const response = await fetch(config.tokenUrl, {
			method: 'POST',
			headers: oauthConfig.getTokenRequestHeaders(),
			body: oauthConfig.getTokenRequestParams(code),
		});
		console.log("🚀 ~ response:", response.json())

		if (!response.ok) {
			console.log("🚀 ~ response:", response)
			const errorData = await response.text();
			console.log("🚀 ~ errorData:", errorData)
			console.error('Token exchange error details:', {
				status: response.status,
				statusText: response.statusText,
				error: errorData,
				platform,
			});
			throw new Error(`Token exchange failed: ${response.statusText}`, {
				cause: {
					status: response.status,
					statusText: response.statusText,
					error: errorData,
					platform,
				},
			});
		}

		return response.json();
	} catch (error: any) {
		console.error('Token exchange error:', {
			platform,
			message: error.message,
			cause: error.cause,
		});
		throw error;
	}
}