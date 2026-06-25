import { NextResponse } from "next/server";
import {
  spotifyConfigured,
  randomVerifier,
  challengeFor,
  buildAuthUrl,
  stashVerifier,
  clearTokens,
} from "@/lib/spotify";

// GET /api/spotify        → begin the PKCE OAuth flow (redirect to Spotify)
// GET /api/spotify?logout → forget the stored tokens
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;

  if (url.searchParams.has("logout")) {
    clearTokens();
    return NextResponse.redirect(`${origin}/?spotify=disconnected`);
  }

  if (!spotifyConfigured()) {
    return NextResponse.redirect(`${origin}/?spotify=unconfigured`);
  }

  const verifier = randomVerifier();
  stashVerifier(verifier);
  const challenge = await challengeFor(verifier);
  return NextResponse.redirect(buildAuthUrl(challenge));
}
