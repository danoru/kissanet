export type Album = {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  genres: string[]; // broad genres from the fixed taxonomy (GENRE_TAGS)
  subgenres: string[]; // free-form, more specific (e.g. "triphop", "speed metal")
  coverUrl: string | null;
  spineColor: string | null; // hex — dominant color from cover, colors the spine
  featured: boolean; // stood face-out on the shelf instead of spine-on
  spotifyId: string | null; // "spotify:album:xxx"
  mbid: string | null;
  rating: number | null; // 1–5
  notes: string | null;
  mood: string[];
  playCount: number;
  lastPlayedAt: string | null;
  addedAt: string;
};

// The fixed set of broad genres. An album can carry several (bands span
// styles — Gorillaz, Linkin Park). More specific styles go in `subgenres`
// as free-form tags ("triphop", "speed metal", "easy listening").
export const GENRE_TAGS = [
  "ambient",
  "blues",
  "classical",
  "country",
  "dance",
  "electronic",
  "experimental",
  "folk",
  "hip-hop",
  "industrial",
  "instrumental",
  "jazz",
  "metal",
  "musical theatre",
  "pop",
  "punk",
  "r&b",
  "regional",
  "rock",
] as const;

export type GenreTag = (typeof GENRE_TAGS)[number];

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
