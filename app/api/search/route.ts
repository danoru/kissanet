import { NextResponse } from "next/server";
import { getAppAccessToken, spotifySearchConfigured } from "@/lib/spotify";

export type SearchResult = {
  spotifyId: string; // "spotify:album:xxx" — ready to store + play
  title: string;
  artist: string;
  year: number | null;
  coverUrl: string;
};

type SpotifyAlbum = {
  uri: string;
  name: string;
  release_date?: string;
  artists?: { name: string }[];
  images?: { url: string; width: number }[];
};

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  if (!spotifySearchConfigured()) {
    return NextResponse.json(
      {
        error:
          "Spotify search isn't configured — set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.",
      },
      { status: 503 },
    );
  }

  let token: string;
  try {
    token = await getAppAccessToken();
  } catch {
    return NextResponse.json(
      { error: "Could not authenticate with Spotify" },
      { status: 502 },
    );
  }

  // NOTE: limit is kept at 10 — this search/credentials path rejects larger
  // values with "Invalid limit" despite the docs allowing up to 50. We only
  // show 8 results, so 10 leaves a little room for de-duping re-releases.
  const url = `https://api.spotify.com/v1/search?type=album&limit=10&q=${encodeURIComponent(
    q,
  )}`;

  let data: { albums?: { items?: SpotifyAlbum[] } };
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      // identical queries are cheap to cache briefly
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Spotify returned ${res.status}` },
        { status: 502 },
      );
    }
    data = await res.json();
  } catch {
    return NextResponse.json(
      { error: "Could not reach Spotify" },
      { status: 502 },
    );
  }

  const seen = new Set<string>();
  const results: SearchResult[] = [];

  for (const a of data.albums?.items ?? []) {
    const artist = a.artists?.map((ar) => ar.name).join(", ") || "Unknown";
    // collapse re-releases / market editions of the same album
    const key = `${artist}::${a.name}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({
      spotifyId: a.uri,
      title: a.name,
      artist,
      year: a.release_date ? Number(a.release_date.slice(0, 4)) || null : null,
      // images are largest-first; the 640px cover gives the spine color room
      coverUrl: a.images?.[0]?.url ?? "",
    });

    if (results.length >= 8) break;
  }

  return NextResponse.json({ results });
}
