"use client";

import { useState } from "react";
import { GENRE_TAGS, MOOD_TAGS } from "@/lib/types";

/** The editable metadata shared by the Add and Edit forms. */
export type AlbumMeta = {
  title: string;
  artist: string;
  year: string; // kept as a string while editing
  genres: string[];
  subgenres: string[];
  spotifyId: string;
  rating: number;
  notes: string;
  mood: string[];
};

export const inputCls =
  "w-full rounded-sm border border-groove bg-shelf/60 px-3 py-2 font-body text-cream placeholder:text-muted/60 focus:border-amber focus:outline-none";

export function Field({
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

/**
 * Title / artist / year / genres / subgenres / spotify / rating / mood / notes.
 * State lives in the parent; this just renders the controls and reports edits
 * through `onChange` as partial patches.
 */
export default function AlbumMetaFields({
  meta,
  onChange,
}: {
  meta: AlbumMeta;
  onChange: (patch: Partial<AlbumMeta>) => void;
}) {
  const [subInput, setSubInput] = useState("");

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  function addSubgenre(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (tag && !meta.subgenres.includes(tag)) {
      onChange({ subgenres: [...meta.subgenres, tag] });
    }
    setSubInput("");
  }

  return (
    <div className="flex flex-col gap-6">
      <Field label="Title">
        <input
          value={meta.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="Artist">
        <input
          value={meta.artist}
          onChange={(e) => onChange({ artist: e.target.value })}
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Year">
          <input
            value={meta.year}
            inputMode="numeric"
            onChange={(e) => onChange({ year: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Genres">
        <div className="flex flex-wrap gap-2">
          {GENRE_TAGS.map((g) => {
            const on = meta.genres.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => onChange({ genres: toggle(meta.genres, g) })}
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
          {meta.subgenres.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                onChange({ subgenres: meta.subgenres.filter((x) => x !== tag) })
              }
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
                meta.subgenres.length
              ) {
                onChange({ subgenres: meta.subgenres.slice(0, -1) });
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
          value={meta.spotifyId}
          onChange={(e) => onChange({ spotifyId: e.target.value })}
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
              onClick={() => onChange({ rating: meta.rating === n ? 0 : n })}
              className={
                n <= meta.rating
                  ? "text-amber"
                  : "text-groove hover:text-amber-dim"
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
            const on = meta.mood.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ mood: toggle(meta.mood, m) })}
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
          value={meta.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={3}
          placeholder="What this record is for…"
          className={`${inputCls} resize-none`}
        />
      </Field>
    </div>
  );
}
