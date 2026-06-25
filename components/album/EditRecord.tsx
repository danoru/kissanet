"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Album } from "@/lib/types";
import AlbumMetaFields, { type AlbumMeta } from "./AlbumMetaFields";

function toMeta(a: Album): AlbumMeta {
  return {
    title: a.title,
    artist: a.artist,
    year: a.year ? String(a.year) : "",
    genres: a.genres,
    subgenres: a.subgenres,
    spotifyId: a.spotifyId ?? "",
    rating: a.rating ?? 0,
    notes: a.notes ?? "",
    mood: a.mood,
  };
}

export default function EditRecord({ album }: { album: Album }) {
  const router = useRouter();
  const [form, setForm] = useState<AlbumMeta>(() => toMeta(album));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = (p: Partial<AlbumMeta>) => setForm((f) => ({ ...f, ...p }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.artist) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/albums/${album.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          artist: form.artist,
          year: form.year ? Number(form.year) : null,
          genres: form.genres,
          subgenres: form.subgenres,
          spotifyId: form.spotifyId || null,
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
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/albums/${album.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not remove");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-8 pb-28 pt-4 md:px-14">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <p className="font-display text-2xl italic leading-snug text-muted">
          Edit the record — fix a detail, add a mood, change your mind.
        </p>
        <Link
          href="/"
          className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-cream"
        >
          ✕ back
        </Link>
      </div>

      <form onSubmit={save} className="flex flex-col gap-6">
        {album.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={album.coverUrl}
            alt=""
            className="h-24 w-24 shrink-0 rounded-sm object-cover ring-1 ring-black/40"
          />
        )}

        <AlbumMetaFields meta={form} onChange={patch} />

        {error && (
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber-dim">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 border-t border-groove pt-6">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full border border-amber/60 px-8 py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-amber transition-all hover:border-amber hover:text-cream hover:shadow-candle-soft disabled:opacity-50"
          >
            {saving ? "saving…" : "▸ save changes"}
          </button>
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-cream"
          >
            cancel
          </Link>

          <span className="ml-auto">
            {confirmDelete ? (
              <span className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
                <span className="text-muted">remove for good?</span>
                <button
                  type="button"
                  onClick={remove}
                  disabled={saving}
                  className="text-amber-dim transition-colors hover:text-amber disabled:opacity-50"
                >
                  yes, remove
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-muted transition-colors hover:text-cream"
                >
                  keep
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted/70 transition-colors hover:text-amber-dim"
              >
                remove from shelf
              </button>
            )}
          </span>
        </div>
      </form>
    </div>
  );
}
