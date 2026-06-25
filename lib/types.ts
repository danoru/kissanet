export type Album = {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  genre: string | null;
  subgenre: string | null;
  coverUrl: string | null;
  spineColor: string | null; // hex — dominant color from cover, colors the spine
  spotifyId: string | null; // "spotify:album:xxx"
  mbid: string | null;
  rating: number | null; // 1–5
  notes: string | null;
  mood: string[];
  playCount: number;
  lastPlayedAt: string | null;
  addedAt: string;
};

export const MOOD_TAGS = [
  "late night",
  "rainy",
  "focus",
  "upbeat",
  "melancholy",
  "energetic",
  "background",
  "loud",
] as const;

export type MoodTag = (typeof MOOD_TAGS)[number];
