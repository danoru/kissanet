import { cookies } from "next/headers";
import { prisma, hasDatabase } from "./prisma";

export const SPOTIFY_SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
].join(" ");

const VERIFIER_COOKIE = "kissa_sp_verifier";
const TOKEN_COOKIE = "kissa_sp_tokens";
// single-user app: one fixed session row
const SESSION_ID = "singleton";

export type Tokens = {
  accessToken: string;
  refreshToken: string | null;
  scope: string | null;
  expiresAt: number; // epoch ms
};

export function spotifyConfigured(): boolean {
  return !!process.env.SPOTIFY_CLIENT_ID && !!process.env.SPOTIFY_REDIRECT_URI;
}

/* ---------------- app token (client credentials, for search) ---------------- */
// Catalog search on the "add a record" page doesn't need a logged-in user, so
// it uses an app-level token from the client-credentials flow. This DOES need
// SPOTIFY_CLIENT_SECRET (unlike the PKCE playback flow, which doesn't).

export function spotifySearchConfigured(): boolean {
  return !!process.env.SPOTIFY_CLIENT_ID && !!process.env.SPOTIFY_CLIENT_SECRET;
}

// cached in module memory for the life of the server process
let appToken: { token: string; expiresAt: number } | null = null;

export async function getAppAccessToken(): Promise<string> {
  if (appToken && appToken.expiresAt - 60_000 > Date.now()) {
    return appToken.token;
  }
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error("Spotify client credentials are not configured");
  }
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!res.ok) throw new Error(`Client-credentials token failed: ${res.status}`);
  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  appToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return appToken.token;
}

/* ----------------------------- PKCE ----------------------------- */

function base64url(bytes: Uint8Array): string {
  let str = "";
  bytes.forEach((b) => {
    str += String.fromCharCode(b);
  });
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomVerifier(): string {
  const bytes = new Uint8Array(64);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

export async function challengeFor(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return base64url(new Uint8Array(digest));
}

export function buildAuthUrl(challenge: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: SPOTIFY_SCOPES,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/* ------------------------- verifier cookie ------------------------- */

export function stashVerifier(verifier: string) {
  cookies().set(VERIFIER_COOKIE, verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
}

export function takeVerifier(): string | null {
  const v = cookies().get(VERIFIER_COOKIE)?.value ?? null;
  if (v) cookies().delete(VERIFIER_COOKIE);
  return v;
}

/* --------------------------- token store --------------------------- */

export async function saveTokens(t: Tokens) {
  // httpOnly cookie: server-side, never exposed to page JS
  cookies().set(TOKEN_COOKIE, JSON.stringify(t), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  if (hasDatabase()) {
    const data = {
      accessToken: t.accessToken,
      refreshToken: t.refreshToken,
      scope: t.scope,
      expiresAt: new Date(t.expiresAt),
    };
    await prisma.spotifySession.upsert({
      where: { id: SESSION_ID },
      update: data,
      create: { id: SESSION_ID, ...data },
    });
  }
}

export async function loadTokens(): Promise<Tokens | null> {
  const raw = cookies().get(TOKEN_COOKIE)?.value;
  if (raw) {
    try {
      return JSON.parse(raw) as Tokens;
    } catch {
      /* fall through to db */
    }
  }
  if (hasDatabase()) {
    const row = await prisma.spotifySession.findUnique({
      where: { id: SESSION_ID },
    });
    if (row) {
      return {
        accessToken: row.accessToken,
        refreshToken: row.refreshToken,
        scope: row.scope,
        expiresAt: row.expiresAt.getTime(),
      };
    }
  }
  return null;
}

export function clearTokens() {
  cookies().delete(TOKEN_COOKIE);
}

/* ----------------------- token exchange/refresh ----------------------- */

type SpotifyTokenResponse = {
  access_token: string;
  refresh_token?: string;
  scope?: string;
  expires_in: number;
};

function toTokens(
  res: SpotifyTokenResponse,
  fallbackRefresh: string | null,
): Tokens {
  return {
    accessToken: res.access_token,
    refreshToken: res.refresh_token ?? fallbackRefresh,
    scope: res.scope ?? null,
    expiresAt: Date.now() + res.expires_in * 1000,
  };
}

export async function exchangeCode(
  code: string,
  verifier: string,
): Promise<Tokens> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    code_verifier: verifier,
  });
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return toTokens(await res.json(), null);
}

export async function refreshTokens(refreshToken: string): Promise<Tokens> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.SPOTIFY_CLIENT_ID!,
  });
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  return toTokens(await res.json(), refreshToken);
}

/** Return a non-expired access token, refreshing + persisting if needed. */
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await loadTokens();
  if (!tokens) return null;
  // refresh a minute before expiry
  if (tokens.expiresAt - 60_000 > Date.now()) return tokens.accessToken;
  if (!tokens.refreshToken) return null;
  const refreshed = await refreshTokens(tokens.refreshToken);
  await saveTokens(refreshed);
  return refreshed.accessToken;
}
