import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
	request: NextRequest,
	{ params }: { params: { platform: string } }
) {
	const { platform } = params;
	const cookieStore = cookies();

	try {
		const profile = cookieStore.get(`${platform}_profile`);

		if (!profile) {
			return Response.json(null);
		}

		return Response.json(JSON.parse(profile.value));
	} catch (error) {
		console.error('Profile fetch error:', error);
		return Response.json(
			{ error: 'Failed to fetch profile' },
			{ status: 500 }
		);
	}
}