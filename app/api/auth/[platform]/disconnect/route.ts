import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const { platform } = params;

  try {
    // Simulated process for disconnecting a platform account
    // For example:
    // 1. Revoke the access token with the platform's API
    // 2. Remove the stored tokens from your database
    // 3. Update the user's connection status in your database

    // Log the platform for debugging
    console.log(`Attempting to disconnect from: ${platform}`);

    // Perform platform-specific disconnection logic here
    if (!['twitter', 'google', 'youtube', 'discord'].includes(platform)) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    // Example success response
    return NextResponse.json({ success: true, message: `Disconnected from ${platform}` });
  } catch (error:any) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect account', details: error.message },
      { status: 500 }
    );
  }
}
