import "server-only";
import { prisma, hasDatabase } from "./prisma";
import { MOCK_ALBUMS } from "./mock";
import type { Album } from "./types";

/** Serialize Prisma's Date fields to strings so they cross the client boundary. */
function serialize(a: {
  lastPlayedAt: Date | null;
  addedAt: Date;
} & Omit<Album, "lastPlayedAt" | "addedAt">): Album {
  return {
    ...a,
    lastPlayedAt: a.lastPlayedAt ? a.lastPlayedAt.toISOString() : null,
    addedAt: a.addedAt.toISOString(),
  };
}

export type NewAlbum = {
  title: string;
  artist: string;
  year?: number | null;
  genre?: string | null;
  subgenre?: string | null;
  coverUrl?: string | null;
  spineColor?: string | null;
  spotifyId?: string | null;
  mbid?: string | null;
  rating?: number | null;
  notes?: string | null;
  mood?: string[];
};

export async function getAlbums(): Promise<Album[]> {
  if (!hasDatabase()) return MOCK_ALBUMS;
  const rows = await prisma.album.findMany({ orderBy: { addedAt: "desc" } });
  return rows.map(serialize);
}

export async function getAlbum(id: string): Promise<Album | null> {
  if (!hasDatabase()) {
    return MOCK_ALBUMS.find((a) => a.id === id) ?? null;
  }
  const row = await prisma.album.findUnique({ where: { id } });
  return row ? serialize(row) : null;
}

export async function createAlbum(data: NewAlbum): Promise<Album> {
  if (!hasDatabase()) {
    throw new Error(
      "No database configured. Set DATABASE_URL to add records permanently.",
    );
  }
  const row = await prisma.album.create({
    data: { ...data, mood: data.mood ?? [] },
  });
  return serialize(row);
}

export async function deleteAlbum(id: string): Promise<void> {
  if (!hasDatabase()) {
    throw new Error("No database configured.");
  }
  await prisma.album.delete({ where: { id } });
}

/** Bump play count + timestamp when a record is put on. */
export async function markPlayed(id: string): Promise<Album | null> {
  if (!hasDatabase()) return null;
  const row = await prisma.album.update({
    where: { id },
    data: { playCount: { increment: 1 }, lastPlayedAt: new Date() },
  });
  return serialize(row);
}
