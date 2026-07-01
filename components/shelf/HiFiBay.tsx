"use client";

import type { Album } from "@/lib/types";
import RecordPlayer from "@/components/player/RecordPlayer";
import NowPlaying from "@/components/player/NowPlaying";
import TubeAmp from "@/components/player/TubeAmp";

/** The receiver faceplate, dark and idle when nothing is on. */
function IdleReceiver() {
  return (
    <div
      className="brushed-metal relative w-full max-w-[320px] rounded-md p-3 opacity-80 ring-1 ring-black/60"
      style={{
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -2px 6px rgba(0,0,0,0.5), 0 20px 40px -20px rgba(0,0,0,0.9)",
      }}
    >
      <div
        className="rounded-[3px] px-3 py-2.5 ring-1 ring-black/70"
        style={{
          background:
            "linear-gradient(180deg, rgba(40,26,10,0.9), rgba(24,14,6,0.95))",
        }}
      >
        <p className="font-display text-base leading-tight text-amber/35">—</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-amber/25">
          no record on
        </p>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-cream/35">
          喫茶 · stereo receiver
        </span>
        <span
          aria-hidden
          className="h-8 w-8 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #4a443c, #201d19 75%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        />
      </div>
    </div>
  );
}

/**
 * The hi-fi counter: receiver, tube amp, and turntable sitting together as
 * furniture. The deck carries whatever record is on (or waits empty), the
 * tubes stay warm either way.
 */
export default function HiFiBay({
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
  album: Album | null;
  playing: boolean;
  track?: string | null;
  position?: number;
  duration?: number;
  spotifyConnected?: boolean;
  spotifyStatus?: "loading" | "unconfigured" | "disconnected" | "ready";
  onToggle?: () => void;
  onConnect?: () => void;
}) {
  return (
    <div className="flex items-end justify-center gap-4 md:gap-6">
      {/* receiver */}
      <div className="w-[34%] min-w-0">
        {album ? (
          <NowPlaying
            album={album}
            playing={playing}
            track={track}
            position={position}
            duration={duration}
            spotifyConnected={spotifyConnected}
            spotifyStatus={spotifyStatus}
            onToggle={onToggle}
            onConnect={onConnect}
          />
        ) : (
          <IdleReceiver />
        )}
      </div>

      {/* tube amp — always warmed up */}
      <div className="w-[20%] min-w-0">
        <TubeAmp playing={playing && !!album} />
      </div>

      {/* turntable */}
      <div className="w-[42%] min-w-0">
        <RecordPlayer album={album} playing={playing} />
      </div>
    </div>
  );
}
