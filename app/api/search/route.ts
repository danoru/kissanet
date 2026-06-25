import { NextResponse } from "next/server";

// MusicBrainz asks for a descriptive User-Agent identifying the app + contact.
const UA = "Kissa/0.1 (personal vinyl collection; https://github.com/kissa)";

type MBArtistCredit = { name: string };
type MBRelease = {
  id: string;
  title: string;
  date?: string;
  "artist-credit"?: MBArtistCredit[];
  "release-group"?: { "primary-type"?: string };
};

export type SearchResult = {
  mbid: string;
  title: string;
  artist: string;
  year: number | null;
  coverUrl: string;
};

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const url = `https://musicbrainz.org/ws/2/release?query=${encodeURIComponent(
    q,
  )}&fmt=json&limit=12`;

  let data: { releases?: MBRelease[] };
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      // MusicBrainz is rate-limited; cache identical queries briefly.
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `MusicBrainz returned ${res.status}` },
        { status: 502 },
      );
    }
    data = await res.json();
  } catch {
    return NextResponse.json(
      { error: "Could not reach MusicBrainz" },
      { status: 502 },
    );
  }

  const seen = new Set<string>();
  const results: SearchResult[] = [];

  for (const r of data.releases ?? []) {
    const artist =
      r["artist-credit"]?.map((a) => a.name).join(", ") || "Unknown";
    const year = r.date ? Number(r.date.slice(0, 4)) || null : null;
    // collapse the many editions of one release down to one row
    const key = `${artist}::${r.title}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({
      mbid: r.id,
      title: r.title,
      artist,
      year,
      coverUrl: `https://coverartarchive.org/release/${r.id}/front-250`,
    });

    if (results.length >= 8) break;
  }

  return NextResponse.json({ results });
}
