"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Album } from "@/lib/types";
import { DEFAULT_SPINE, readableText } from "@/lib/color";

/**
 * The turntable. A dark vinyl disc with groove rings spins (when playing),
 * carrying the album cover as its centre label. A tonearm drops onto the
 * record once playback begins — and the disc spins up only after it lands.
 */
export default function RecordPlayer({
  album,
  playing,
}: {
  album: Album;
  playing: boolean;
}) {
  const base = album.spineColor ?? DEFAULT_SPINE;
  const reduce = useReducedMotion();

  // The needle drops a beat after playback starts, so the turntable has time
  // to settle into view first. The disc spins up only once the needle lands.
  // Tracking this as its own state (rather than reading `playing` directly)
  // means the drop animates even when the player mounts already playing.
  const [landed, setLanded] = useState(false);
  useEffect(() => {
    if (!playing) {
      setLanded(false);
      return;
    }
    if (reduce) {
      setLanded(true);
      return;
    }
    const t = setTimeout(() => setLanded(true), 550);
    return () => clearTimeout(t);
  }, [playing, reduce]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      {/* plinth */}
      <div
        className="wood-grain absolute inset-0 rounded-2xl"
        style={{
          backgroundColor: "rgb(var(--color-wood))",
          boxShadow:
            "inset 0 1px 0 rgb(var(--color-wood-hi) / 0.4), 0 30px 60px -25px rgba(0,0,0,0.9)",
          border: "1px solid rgb(var(--color-groove))",
        }}
      />

      {/* the record */}
      <div className="absolute left-1/2 top-1/2 aspect-square w-[84%] -translate-x-1/2 -translate-y-1/2">
        <div
          className="h-full w-full rounded-full"
          style={{
            animation: "spin-slow 4s linear infinite",
            animationPlayState: landed ? "running" : "paused",
            background:
              "repeating-radial-gradient(circle at center, #0c0a08 0px, #0c0a08 2px, #14110d 3px, #0c0a08 4px), radial-gradient(circle at 38% 32%, rgba(255,255,255,0.05), transparent 45%)",
            boxShadow: "0 12px 30px -12px rgba(0,0,0,0.9)",
          }}
        >
          {/* centre label = the cover */}
          <div className="absolute left-1/2 top-1/2 aspect-square w-[38%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full ring-1 ring-black/60">
            {album.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={album.coverUrl}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center p-2 text-center"
                style={{ backgroundColor: base, color: readableText(base) }}
              >
                <span className="font-display text-sm font-medium leading-tight">
                  {album.title}
                </span>
              </div>
            )}
            {/* spindle hole */}
            <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-room ring-1 ring-black/70" />
          </div>
        </div>
      </div>

      {/* tonearm — pivots in from the top-right, drops onto the record when playing */}
      <motion.div
        className="absolute right-[10%] top-[10%] origin-top-right"
        initial={{ rotate: -46 }}
        animate={{ rotate: landed ? 8 : -46 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      >
        <div className="relative">
          {/* pivot */}
          <span className="block h-5 w-5 rounded-full bg-[#3a2c1d] ring-1 ring-black/50 shadow-inner" />
          {/* arm */}
          <span
            className="absolute left-2 top-2 h-[150px] w-[5px] origin-top rounded-full"
            style={{
              background: "linear-gradient(180deg, #5a4630, #2e2218)",
              boxShadow: "0 2px 6px -2px rgba(0,0,0,0.8)",
            }}
          />
          {/* headshell */}
          <span className="absolute left-[2px] top-[148px] h-4 w-3 rounded-sm bg-[#1a140d] ring-1 ring-black/60" />
        </div>
      </motion.div>
    </div>
  );
}
