"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/app/api/search/route";
import { GENRE_TAGS, MOOD_TAGS } from "@/lib/types";
import { extractDominantColor } from "@/lib/dominantColor";

type Form = {
  title: string;
  artist: string;
  year: string;
  genres: string[];
  subgenres: string[];
  spotifyId: string;
  coverUrl: string;
  rating: number;
  notes: string;
  mood: string[];
};

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
  const [subInput, setSubInput] = useState("");
  const [spineColor, setSpineColor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
    setForm((f) => ({
      ...f,
      title: r.title,
      artist: r.artist,
      year: r.year ? String(r.year) : "",
      coverUrl: r.coverUrl,
      spotifyId: r.spotifyId,
    }));
    // pull the dominant color from the cover for the spine
    const color = await extractDominantColor(r.coverUrl);
    setSpineColor(color);
  }

  function toggleMood(m: string) {
    setForm((f) => ({
      ...f,
      mood: f.mood.includes(m)
        ? f.mood.filter((x) => x !== m)
        : [...f.mood, m],
    }));
  }

  function toggleGenre(g: string) {
    setForm((f) => ({
      ...f,
      genres: f.genres.includes(g)
        ? f.genres.filter((x) => x !== g)
        : [...f.genres, g],
    }));
  }

  function addSubgenre(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (!tag) return;
    setForm((f) =>
      f.subgenres.includes(tag)
        ? f
        : { ...f, subgenres: [...f.subgenres, tag] },
    );
    setSubInput("");
  }

  function removeSubgenre(tag: string) {
    setForm((f) => ({
      ...f,
      subgenres: f.subgenres.filter((x) => x !== tag),
    }));
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
          <div className="flex items-start gap-5">
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
            <div className="flex flex-1 flex-col gap-3">
              <Field label="Title">
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Artist">
                <input
                  value={form.artist}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, artist: e.target.value }))
                  }
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Year">
              <input
                value={form.year}
                inputMode="numeric"
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: e.target.value }))
                }
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Genres">
            <div className="flex flex-wrap gap-2">
              {GENRE_TAGS.map((g) => {
                const on = form.genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                      on
                        ? "border-amber bg-amber/10 text-amber"
                        : "border-groove text-muted hover:border-amber-dim hover:text-cream"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Subgenres">
            <div className="flex flex-wrap items-center gap-2">
              {form.subgenres.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => removeSubgenre(tag)}
                  className="group flex items-center gap-1 rounded-full border border-amber/50 bg-amber/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber"
                  aria-label={`Remove ${tag}`}
                >
                  {tag}
                  <span className="text-amber/60 group-hover:text-cream">×</span>
                </button>
              ))}
              <input
                value={subInput}
                onChange={(e) => setSubInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addSubgenre(subInput);
                  } else if (
                    e.key === "Backspace" &&
                    !subInput &&
                    form.subgenres.length
                  ) {
                    removeSubgenre(form.subgenres[form.subgenres.length - 1]);
                  }
                }}
                onBlur={() => addSubgenre(subInput)}
                placeholder="triphop, speed metal…  (enter to add)"
                className="min-w-[12rem] flex-1 rounded-sm border border-groove bg-shelf/60 px-3 py-2 font-body text-cream placeholder:text-muted/60 focus:border-amber focus:outline-none"
              />
            </div>
          </Field>

          <Field label="Spotify album URI">
            <input
              value={form.spotifyId}
              onChange={(e) =>
                setForm((f) => ({ ...f, spotifyId: e.target.value }))
              }
              placeholder="spotify:album:…"
              className={`${inputCls} font-mono text-sm`}
            />
          </Field>

          <Field label="Rating">
            <div className="flex gap-1 text-2xl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      rating: f.rating === n ? 0 : n,
                    }))
                  }
                  className={
                    n <= form.rating ? "text-amber" : "text-groove hover:text-amber-dim"
                  }
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </div>
          </Field>

          <Field label="Mood">
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((m) => {
                const on = form.mood.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMood(m)}
                    className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                      on
                        ? "border-amber bg-amber/10 text-amber"
                        : "border-groove text-muted hover:border-amber-dim hover:text-cream"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Liner notes">
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={3}
              placeholder="What this record is for…"
              className={`${inputCls} resize-none`}
            />
          </Field>

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

const inputCls =
  "w-full rounded-sm border border-groove bg-shelf/60 px-3 py-2 font-body text-cream placeholder:text-muted/60 focus:border-amber focus:outline-none";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
