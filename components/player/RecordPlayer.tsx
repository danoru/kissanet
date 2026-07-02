"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Album } from "@/lib/types";
import { DEFAULT_SPINE, readableText } from "@/lib/color";

// the overhead platter is a true circle foreshortened flat when it sits on the
// deck; in the "view from above" modal it reads closer to head-on.
const SQUASH = 0.62;

/**
 * The turntable as it sits in the room: a real object seen from across the
 * counter. A wooden plinth carries a smoked-acrylic dust cover that catches the
 * lamp and hides the platter beneath — you can tell a record is on (the cover
 * glows faintly, the power lamp burns), but you don't look down onto a spinning
 * disc. To watch it turn, you lift the lid: clicking the deck opens an overhead
 * view of the platter with the cover art as its label.
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
  const base = album?.spineColor ?? DEFAULT_SPINE;

  const [open, setOpen] = useState(false);

  // portal target only exists on the client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Esc closes the overhead view
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Lift the lid — view the turntable from above"
        className="group relative mx-auto block w-full max-w-[300px] cursor-pointer text-left"
      >
        {/* ---- smoked-acrylic dust cover ---- */}
        <div className="relative">
          {/* hinge barrel across the back */}
          <div
            aria-hidden
            className="mx-[6%] h-[5px] rounded-t-[3px]"
            style={{
              background:
                "linear-gradient(180deg, #4a443c, #1b1712)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          />

          {/* the lid's top plane — foreshortened, glossy, opaque enough that
              the platter beneath never shows. A diagonal gloss streak reads as
              the lamp caught on the acrylic. */}
          <div
            className="relative rounded-t-[3px]"
            style={{
              paddingBottom: "20%",
              background:
                "linear-gradient(160deg, rgba(52,58,58,0.95) 0%, rgba(20,22,22,0.96) 46%, rgba(30,33,33,0.95) 100%)",
              borderLeft: "1px solid rgba(0,0,0,0.5)",
              borderRight: "1px solid rgba(0,0,0,0.5)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          >
            {/* the gloss reflection sliding across the lid */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-t-[3px]"
              style={{
                background:
                  "linear-gradient(115deg, transparent 18%, rgba(255,255,255,0.16) 30%, rgba(255,255,255,0.04) 38%, transparent 52%, transparent 82%, rgba(255,240,220,0.06) 92%)",
              }}
            />
          </div>

          {/* the lid's front pane — smoked translucent. A soft circular sheen
              sits where the platter is; when a record is on, the album's colour
              blooms dimly through the glass. */}
          <div
            className="relative"
            style={{
              paddingBottom: "26%",
              background:
                "linear-gradient(180deg, rgba(24,27,27,0.92), rgba(14,15,15,0.95))",
              borderLeft: "1px solid rgba(0,0,0,0.55)",
              borderRight: "1px solid rgba(0,0,0,0.55)",
              boxShadow:
                "inset 0 8px 14px -10px rgba(255,255,255,0.18), inset 0 -6px 10px -8px rgba(0,0,0,0.7)",
            }}
          >
            {/* faint album glow through the smoke — a low bloom just above the
                plinth, not a wash across the whole pane */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-opacity duration-700"
              style={{
                opacity: active ? 0.16 : album ? 0.07 : 0,
                background: `radial-gradient(ellipse 26% 45% at 30% 82%, ${base}, transparent 68%)`,
                mixBlendMode: "screen",
              }}
            />
            {/* the platter's edge, barely legible behind the acrylic */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 40% 150% at 33% 50%, rgba(0,0,0,0.5) 40%, transparent 72%)",
              }}
            />
            {/* vertical glass reflections */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-[12%] w-[2px]"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-[22%] w-px"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />

            {/* "lift the lid" affordance, on hover */}
            <span className="pointer-events-none absolute bottom-[10%] right-[6%] font-mono text-[7px] uppercase tracking-[0.25em] text-cream/0 transition-colors duration-300 group-hover:text-cream/50">
              view from above ↗
            </span>
          </div>
        </div>

        {/* ---- the plinth's front edge — wood, with the controls ---- */}
        <div
          className="wood-grain-h relative h-[26px] rounded-b-[4px]"
          style={{
            backgroundColor: "rgb(var(--color-wood))",
            border: "1px solid rgba(0,0,0,0.55)",
            borderTop: "none",
            boxShadow:
              "inset 0 2px 3px -2px rgba(255,255,255,0.28), inset 0 -7px 9px -6px rgba(0,0,0,0.9), 0 22px 34px -18px rgba(0,0,0,0.95)",
          }}
        >
          {/* brass speed knob + power lamp */}
          <div className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
            <span
              className="h-3.5 w-3.5 rounded-full"
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
                boxShadow: active
                  ? "0 0 6px rgba(255,110,60,0.8)"
                  : undefined,
              }}
            />
          </div>

          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[6px] uppercase tracking-[0.3em] text-[#d8b471]/50">
            kissa · 33⅓
          </span>
        </div>

        {/* feet */}
        <span aria-hidden className="mt-[1px] flex justify-between px-5">
          <span className="h-[6px] w-8 rounded-b-[3px] bg-black/80" />
          <span className="h-[6px] w-8 rounded-b-[3px] bg-black/80" />
        </span>
      </button>

      {/* ---------- OVERHEAD VIEW ---------- */}
      {/* portalled to the body so `fixed` escapes the cabinet's scale transform */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
          <motion.div
            className="fixed inset-0 z-[45] flex items-center justify-center px-6 py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              aria-label="Close the lid"
              onClick={() => setOpen(false)}
              className="absolute inset-0 -z-10 cursor-default bg-room/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex w-full max-w-md flex-col items-center gap-6 rounded-lg border border-wood-hi/25 bg-room/80 p-8 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)]"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted transition-colors hover:text-cream"
              >
                ✕
              </button>

              <OverheadDeck album={album} spinning={active} reduce={!!reduce} />

              <div className="text-center">
                {album ? (
                  <>
                    <p className="font-display text-lg leading-tight text-cream">
                      {album.title}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber/70">
                      {album.artist}
                    </p>
                  </>
                ) : (
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cream/45">
                    nothing on the deck
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

/**
 * The platter seen from directly above — what you get when the lid is lifted.
 * The vinyl turns (once the needle has landed), its label is the cover art, and
 * the S-shaped tonearm rests across the grooves.
 */
function OverheadDeck({
  album,
  spinning,
  reduce,
}: {
  album: Album | null;
  spinning: boolean;
  reduce: boolean;
}) {
  const base = album?.spineColor ?? DEFAULT_SPINE;

  // let the arm settle onto the record a beat after the view opens
  const [landed, setLanded] = useState(false);
  useEffect(() => {
    if (!spinning) {
      setLanded(false);
      return;
    }
    if (reduce) {
      setLanded(true);
      return;
    }
    const t = setTimeout(() => setLanded(true), 450);
    return () => clearTimeout(t);
  }, [spinning, reduce]);

  return (
    <div className="relative w-[min(72vw,300px)]">
      <div style={{ transform: `scaleY(${SQUASH})` }}>
        <div className="relative aspect-square">
          {/* platter thickness peeking out below */}
          <div
            className="absolute inset-0 translate-y-[10px] rounded-full"
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
            /* the vinyl — spins while the record is on */
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
        className="absolute right-[2%] top-[6%] h-[62%] w-[42%]"
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
          <circle cx="90" cy="12" r="7" fill="#141110" stroke="rgba(0,0,0,0.6)" />
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
        <span
          className="absolute h-[22%] w-[17%] rounded-full"
          style={{
            left: "68%",
            top: "10%",
            background:
              "radial-gradient(circle at 38% 30%, #47403a, #16120e 78%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.18), 0 3px 6px -2px rgba(0,0,0,0.8)",
          }}
        />
      </motion.div>
    </div>
  );
}
