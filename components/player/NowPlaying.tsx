"use client";

import type { Album } from "@/lib/types";

/** ms → m:ss */
function clock(ms?: number) {
  if (!ms || ms < 0) return "0:00";
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** A column of VU bars that jitter while audio plays. */
function VuMeter({ playing }: { playing: boolean }) {
  // staggered delays/durations so the bars don't bounce in lockstep
  const bars = [0, 0.18, 0.36, 0.1, 0.28, 0.42];
  return (
    <div className="flex h-10 items-end gap-[3px] rounded-sm bg-black/55 px-1.5 py-1 ring-1 ring-black/60">
      {bars.map((delay, i) => (
        <span
          key={i}
          className="w-[3px] origin-bottom rounded-full animate-vu"
          style={{
            height: "100%",
            background:
              "linear-gradient(180deg, #ffd27a, #d98a2e 55%, #7a4a16)",
            animationDelay: `${delay}s`,
            animationDuration: `${0.7 + (i % 3) * 0.25}s`,
            animationPlayState: playing ? "running" : "paused",
            transform: playing ? undefined : "scaleY(0.25)",
            opacity: playing ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

/**
 * The "Now Playing" panel, styled as a vintage stereo receiver: a brushed
 * aluminium faceplate with an amber tuning-dial window, a VU meter, and a
 * power-knob play button. Track/position/duration come from Spotify when
 * connected; otherwise it shows the record that's on, turning in silence.
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
    duration && duration > 0
      ? Math.min(100, ((position ?? 0) / duration) * 100)
      : 0;

  return (
    <div
      className="brushed-metal relative w-full max-w-[320px] rounded-md p-3 ring-1 ring-black/60"
      style={{
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -2px 6px rgba(0,0,0,0.5), 0 20px 40px -20px rgba(0,0,0,0.9)",
      }}
    >
      {/* corner screws */}
      {[
        "left-2 top-2",
        "right-2 top-2",
        "left-2 bottom-2",
        "right-2 bottom-2",
      ].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={`absolute ${pos} h-2 w-2 rounded-full`}
          style={{
            background: "radial-gradient(circle at 35% 30%, #b9b2a8, #2c2823)",
            boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.5)",
          }}
        />
      ))}

      <div className="flex gap-3">
        {/* the amber tuning-dial window */}
        <div
          className="relative min-w-0 flex-1 overflow-hidden rounded-[3px] px-3 py-2 ring-1 ring-black/70"
          style={{
            background:
              "linear-gradient(180deg, rgba(80,46,12,0.9), rgba(40,22,6,0.95))",
            boxShadow:
              "inset 0 0 24px rgba(255,170,60,0.18), inset 0 1px 0 rgba(255,200,120,0.15)",
          }}
        >
          {/* tuning ticks across the top */}
          <div className="mb-1 flex items-end justify-between">
            {Array.from({ length: 17 }).map((_, i) => (
              <span
                key={i}
                aria-hidden
                className="w-px bg-amber/40"
                style={{ height: i % 4 === 0 ? 6 : 3 }}
              />
            ))}
          </div>

          <p
            className="truncate font-display text-base leading-tight text-amber"
            style={{ textShadow: "0 0 10px rgba(220,150,60,0.55)" }}
          >
            {track ?? album.title}
          </p>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.25em] text-amber/70">
            {album.artist}
          </p>

          {/* the tuning needle sweeping the dial = progress */}
          <div className="relative mt-2 h-px w-full bg-amber/25">
            <span
              className="absolute -top-[3px] h-[7px] w-[2px] rounded-full bg-amber transition-[left] duration-1000 ease-linear"
              style={{
                left: `${pct}%`,
                boxShadow: "0 0 6px rgba(220,150,60,0.9)",
              }}
            />
          </div>
          <div className="mt-1 flex justify-between font-mono text-[9px] tracking-widest text-amber/50">
            <span>{clock(position)}</span>
            <span>{clock(duration)}</span>
          </div>
        </div>

        {/* VU meter */}
        <div className="flex flex-col items-center justify-between gap-1">
          <VuMeter playing={playing} />
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-cream/40">
            vu
          </span>
        </div>
      </div>

      {/* lower deck: brand plate + power knob */}
      <div className="mt-2.5 flex items-center justify-between">
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-cream/45">
          喫茶 · stereo receiver
        </span>

        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={playing ? "Pause" : "Play"}
            className="group flex h-9 w-9 items-center justify-center rounded-full text-amber transition-transform active:scale-95"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #5a534a, #221f1b 75%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px -3px rgba(0,0,0,0.8)",
            }}
          >
            <span
              className="text-xs transition-colors group-hover:text-cream"
              style={{ textShadow: "0 0 8px rgba(220,150,60,0.6)" }}
            >
              {playing ? "❚❚" : "▶"}
            </span>
          </button>
        )}
      </div>

      {/* connection note */}
      {!spotifyConnected && (
        <div className="mt-2.5 border-t border-black/40 pt-2">
          {spotifyStatus === "disconnected" && onConnect ? (
            <button
              type="button"
              onClick={onConnect}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber transition-colors hover:text-cream"
            >
              ♪ connect spotify to hear it
            </button>
          ) : (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/45">
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
