"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Album } from "@/lib/types";
import { DEFAULT_SPINE, readableText } from "@/lib/color";

// the platter seen from across the counter: a circle foreshortened flat.
// Everything inside the squashed wrapper (grooves, label, spin) inherits the
// same foreshortening, so the rotation reads as a disc turning in that plane.
const SQUASH = 0.46;

/**
 * The turntable as an object on the counter: a wooden plinth with a visible
 * front edge and feet, an elliptical platter carrying the vinyl (which spins
 * once the needle lands), and an S-shaped tonearm that swings in from its
 * rest. With no record on, the bare rubber mat waits and the arm stays parked.
 */
export default function RecordPlayer({
  album,
  playing,
}: {
  album: Album | null;
  playing: boolean;
}) {
  const reduce = useReducedMotion();
  const active = !!album && playing;

  const [landed, setLanded] = useState(false);
  useEffect(() => {
    if (!active) {
      setLanded(false);
      return;
    }
    if (reduce) {
      setLanded(true);
      return;
    }
    const t = setTimeout(() => setLanded(true), 550);
    return () => clearTimeout(t);
  }, [active, reduce]);

  const base = album?.spineColor ?? DEFAULT_SPINE;

  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      {/* ---- deck top ---- */}
      <div
        className="wood-grain relative rounded-t-md"
        style={{
          paddingBottom: "50%",
          backgroundColor: "rgb(var(--color-wood))",
          border: "1px solid rgba(0,0,0,0.5)",
          borderBottom: "none",
          boxShadow:
            "inset 0 2px 0 rgb(var(--color-wood-hi) / 0.45), inset 0 -10px 18px -12px rgba(0,0,0,0.7)",
        }}
      >
        {/* platter + record, foreshortened */}
        <div
          className="absolute left-[5%] top-1/2 w-[58%]"
          style={{ transform: `translateY(-50%) scaleY(${SQUASH})` }}
        >
          <div className="relative aspect-square">
            {/* platter thickness peeking out below */}
            <div
              className="absolute inset-0 translate-y-[14px] rounded-full"
              style={{ background: "#0a0806" }}
            />
            {/* the platter */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 40% 30%, #3c362e, #191512 72%)",
                boxShadow: "0 30px 44px -18px rgba(0,0,0,0.85)",
              }}
            />
            {/* rubber mat, ribbed */}
            <div
              className="absolute inset-[3%] rounded-full"
              style={{
                background:
                  "repeating-radial-gradient(circle at center, #14100c 0 6px, #1a1510 6px 12px)",
              }}
            />

            {album ? (
              /* the vinyl — spins up once the needle lands */
              <div
                className="absolute inset-[1%] rounded-full"
                style={{
                  animation: "spin-slow 3.8s linear infinite",
                  animationPlayState: landed ? "running" : "paused",
                  background:
                    "repeating-radial-gradient(circle at center, #0c0a08 0px, #0c0a08 2px, #16120e 3px, #0c0a08 4px)",
                }}
              >
                {/* centre label = the cover */}
                <div className="absolute left-1/2 top-1/2 aspect-square w-[37%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full ring-1 ring-black/60">
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
                </div>
                <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-room ring-1 ring-black/70" />
              </div>
            ) : (
              /* bare spindle waiting */
              <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2c2822] ring-1 ring-black/70" />
            )}

            {/* the lamp's static reflection lying across the disc */}
            <div
              className="pointer-events-none absolute inset-[1%] rounded-full"
              style={{
                background:
                  "conic-gradient(from 205deg at 50% 50%, transparent 0deg, rgba(255,220,170,0.10) 12deg, transparent 28deg, transparent 178deg, rgba(255,220,170,0.06) 194deg, transparent 210deg)",
              }}
            />
          </div>
        </div>

        {/* ---- tonearm: counterweight + pivot + S-curve + headshell ---- */}
        <motion.div
          aria-hidden
          className="absolute right-[4%] top-[10%] h-[58%] w-[44%]"
          style={{ transformOrigin: "76% 20%" }}
          initial={false}
          animate={{ rotate: landed ? 0 : -26 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            fill="none"
            preserveAspectRatio="none"
          >
            {/* counterweight behind the pivot */}
            <circle cx="90" cy="12" r="7" fill="#141110" stroke="rgba(0,0,0,0.6)" />
            {/* S-shaped arm tube */}
            <path
              d="M 78 20 C 62 26, 52 38, 46 54 S 32 82, 25 90"
              stroke="#a99f92"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 78 20 C 62 26, 52 38, 46 54 S 32 82, 25 90"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            {/* headshell */}
            <rect
              x="18"
              y="86"
              width="11"
              height="9"
              rx="2"
              transform="rotate(-32 23 90)"
              fill="#1a140d"
              stroke="rgba(0,0,0,0.6)"
            />
          </svg>
          {/* pivot base — drawn over the arm so it reads as the bearing */}
          <span
            className="absolute h-[22%] w-[17%] rounded-full"
            style={{
              left: "68%",
              top: "10%",
              background: "radial-gradient(circle at 38% 30%, #47403a, #16120e 78%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 3px 6px -2px rgba(0,0,0,0.8)",
            }}
          />
        </motion.div>

        {/* ---- controls: brass speed knob + power lamp, bottom-left ---- */}
        <div className="absolute bottom-[7%] left-[5%] flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #e3c489, #7a5a24 70%, #3a2a12)",
              boxShadow: "0 2px 4px -1px rgba(0,0,0,0.8)",
            }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full transition-shadow"
            style={{
              background: active ? "#ff7a50" : "#54331f",
              boxShadow: active ? "0 0 6px rgba(255,110,60,0.8)" : undefined,
            }}
          />
        </div>
      </div>

      {/* ---- the plinth's front edge — visible thickness ---- */}
      <div
        className="wood-grain-h relative h-[18px] rounded-b-[4px]"
        style={{
          backgroundColor: "#2b1d12",
          border: "1px solid rgba(0,0,0,0.55)",
          boxShadow:
            "inset 0 2px 3px -2px rgba(255,255,255,0.22), inset 0 -6px 8px -6px rgba(0,0,0,0.9), 0 22px 34px -18px rgba(0,0,0,0.95)",
        }}
      >
        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[6px] uppercase tracking-[0.3em] text-[#d8b471]/50">
          kissa · 33⅓
        </span>
      </div>

      {/* feet */}
      <div aria-hidden className="flex justify-between px-5">
        <span className="h-[6px] w-8 rounded-b-[3px] bg-black/80" />
        <span className="h-[6px] w-8 rounded-b-[3px] bg-black/80" />
      </div>
    </div>
  );
}
