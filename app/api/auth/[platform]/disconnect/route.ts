import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const { platform } = params;

  try {
    // Here you would typically:
    // 1. Revoke the access token with the platform's API
    // 2. Remove the stored tokens from your database
    // 3. Update the user's connection status

    return Response.json({ success: true });
  } catch (error) {
    console.error('Disconnect error:', error);
    return Response.json(
      { error: 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}