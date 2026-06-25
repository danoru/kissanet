import { NextResponse } from "next/server";
import { takeVerifier, exchangeCode, saveTokens } from "@/lib/spotify";

// Spotify redirects back here with ?code (or ?error) after the user approves.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${origin}/?spotify=denied`);
  }

  const verifier = takeVerifier();
  if (!code || !verifier) {
    return NextResponse.redirect(`${origin}/?spotify=error`);
  }

  try {
    const tokens = await exchangeCode(code, verifier);
    await saveTokens(tokens);
    return NextResponse.redirect(`${origin}/?spotify=connected`);
  } catch {
    return NextResponse.redirect(`${origin}/?spotify=error`);
  }
}
