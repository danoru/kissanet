import { NextResponse } from "next/server";
import { getValidAccessToken, spotifyConfigured } from "@/lib/spotify";

// Reads cookies / refreshes tokens per request — never cache.
export const dynamic = "force-dynamic";

// The Web Playback SDK calls this to get a fresh access token. Tokens live
// server-side (cookie/DB); only this short-lived access token reaches the page.
export async function GET() {
  if (!spotifyConfigured()) {
    return NextResponse.json(
      { connected: false, configured: false },
      { status: 200 },
    );
  }
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { connected: false, configured: true },
        { status: 200 },
      );
    }
    return NextResponse.json({ connected: true, configured: true, accessToken });
  } catch {
    return NextResponse.json(
      { connected: false, configured: true },
      { status: 200 },
    );
  }
}
