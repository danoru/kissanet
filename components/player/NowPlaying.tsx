"use client";

import type { Album } from "@/lib/types";

/**
 * The track-info overlay that sits under the turntable. Once the Spotify
 * Web Playback SDK is wired in, `track`/`position`/`duration` come from it;
 * until then it shows the record that's on and a quiet "not connected" note.
 */
export default function NowPlaying({
  album,
  playing,
  track,
  position,
  duration,
  spotifyConnected,
  spotifyStatus,
  onToggle,
  onConnect,
}: {
  album: Album;
  playing: boolean;
  track?: string | null;
  position?: number;
  duration?: number;
  spotifyConnected?: boolean;
  spotifyStatus?: "loading" | "unconfigured" | "disconnected" | "ready";
  onToggle?: () => void;
  onConnect?: () => void;
}) {
  const pct =
    duration && duration > 0 ? Math.min(100, ((position ?? 0) / duration) * 100) : 0;

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-display text-xl text-cream">
            {track ?? album.title}
          </p>
          <p className="truncate font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
            {album.artist}
          </p>
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-groove text-amber transition-colors hover:border-amber hover:text-cream"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? "❚❚" : "▶"}
          </button>
        )}
      </div>

      <div className="h-px w-full bg-groove">
        <div
          className="h-px bg-amber transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>

      {!spotifyConnected && (
        <div className="flex items-center gap-3">
          {spotifyStatus === "disconnected" && onConnect ? (
            <button
              type="button"
              onClick={onConnect}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber transition-colors hover:text-cream"
            >
              ♪ connect spotify to hear it
            </button>
          ) : (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70">
              {spotifyStatus === "loading"
                ? "reaching for the needle…"
                : "spotify not connected — the record turns in silence"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
