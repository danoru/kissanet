import { NextResponse } from "next/server";
import { getAlbums, createAlbum, type NewAlbum } from "@/lib/albums";
import { hasDatabase } from "@/lib/prisma";

export async function GET() {
  const albums = await getAlbums();
  return NextResponse.json({ albums, persistent: hasDatabase() });
}

export async function POST(req: Request) {
  let body: Partial<NewAlbum>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.title || !body.artist) {
    return NextResponse.json(
      { error: "title and artist are required" },
      { status: 400 },
    );
  }

  try {
    const album = await createAlbum({
      title: body.title,
      artist: body.artist,
      year: body.year ?? null,
      genres: body.genres ?? [],
      subgenres: body.subgenres ?? [],
      coverUrl: body.coverUrl ?? null,
      spineColor: body.spineColor ?? null,
      spotifyId: body.spotifyId ?? null,
      mbid: body.mbid ?? null,
      rating: body.rating ?? null,
      notes: body.notes ?? null,
      mood: body.mood ?? [],
    });
    return NextResponse.json({ album }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create album";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
