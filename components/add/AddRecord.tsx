"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/app/api/search/route";
import { extractDominantColor } from "@/lib/dominantColor";
import AlbumMetaFields, { type AlbumMeta } from "@/components/album/AlbumMetaFields";

type Form = AlbumMeta & { coverUrl: string };

const EMPTY: Form = {
  title: "",
  artist: "",
  year: "",
  genres: [],
  subgenres: [],
  spotifyId: "",
  coverUrl: "",
  rating: 0,
  notes: "",
  mood: [],
};

export default function AddRecord() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [picked, setPicked] = useState(false);
  const [spineColor, setSpineColor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const patch = (p: Partial<Form>) => setForm((f) => ({ ...f, ...p }));

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.results ?? []);
      if ((data.results ?? []).length === 0) {
        setSearchError("No records found by that name.");
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function pick(r: SearchResult) {
    setPicked(true);
    patch({
      title: r.title,
      artist: r.artist,
      year: r.year ? String(r.year) : "",
      coverUrl: r.coverUrl,
      spotifyId: r.spotifyId,
    });
    // pull the dominant color from the cover for the spine
    const color = await extractDominantColor(r.coverUrl);
    setSpineColor(color);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.artist) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          artist: form.artist,
          year: form.year ? Number(form.year) : null,
          genres: form.genres,
          subgenres: form.subgenres,
          spotifyId: form.spotifyId || null,
          coverUrl: form.coverUrl || null,
          spineColor,
          rating: form.rating || null,
          notes: form.notes || null,
          mood: form.mood,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save");
      router.push("/");
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-8 pb-28 pt-4 md:px-14">
      <p className="mb-8 max-w-xl font-display text-2xl italic leading-snug text-muted">
        Find a record, then make it yours — a rating, a mood, a few words for
        later.
      </p>

      {/* search */}
      <form onSubmit={runSearch} className="flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by album or artist…"
          className="flex-1 rounded-sm border border-groove bg-shelf/60 px-4 py-3 font-body text-cream placeholder:text-muted/60 focus:border-amber focus:outline-none"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-sm border border-amber/60 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-amber transition-colors hover:border-amber hover:text-cream disabled:opacity-50"
        >
          {searching ? "…" : "search"}
        </button>
      </form>

      {searchError && (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-amber-dim">
          {searchError}
        </p>
      )}

      {/* results */}
      {results.length > 0 && !picked && (
        <ul className="mt-6 flex flex-col divide-y divide-groove border-y border-groove">
          {results.map((r) => (
            <li key={r.spotifyId}>
              <button
                type="button"
                onClick={() => pick(r)}
                className="group flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-shelf/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.coverUrl}
                  alt=""
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility =
                      "hidden";
                  }}
                  className="h-12 w-12 shrink-0 rounded-sm object-cover ring-1 ring-black/40"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-lg text-cream">
                    {r.title}
                  </span>
                  <span className="block truncate font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                    {r.artist}
                    {r.year ? ` · ${r.year}` : ""}
                  </span>
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber opacity-0 transition-opacity group-hover:opacity-100">
                  choose →
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* details form */}
      {picked && (
        <form onSubmit={save} className="mt-8 flex flex-col gap-6">
          {form.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.coverUrl}
              alt=""
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
              className="h-24 w-24 shrink-0 rounded-sm object-cover ring-1 ring-black/40"
            />
          )}

          <AlbumMetaFields meta={form} onChange={patch} />

          {spineColor && (
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              spine color
              <span
                className="inline-block h-4 w-4 rounded-sm ring-1 ring-black/40"
                style={{ backgroundColor: spineColor }}
              />
              {spineColor}
            </p>
          )}

          {saveError && (
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber-dim">
              {saveError}
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full border border-amber/60 px-8 py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-amber transition-all hover:border-amber hover:text-cream hover:shadow-candle-soft disabled:opacity-50"
            >
              {saving ? "shelving…" : "▸ add to the shelf"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPicked(false);
                setForm(EMPTY);
                setSpineColor(null);
                setSaveError(null);
              }}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-cream"
            >
              start over
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
