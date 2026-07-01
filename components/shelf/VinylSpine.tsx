"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Album } from "@/lib/types";
import { DEFAULT_SPINE, spineGradient } from "@/lib/color";
import SpineLabel from "./SpineLabel";

// a low-opacity fibre-noise texture so the spine reads as printed cardboard
// rather than a flat swatch (same feTurbulence trick as GrainOverlay)
const PAPER_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E\")";

// how far each record is turned on the shelf, and how deep its cover edge sits
const TILT = 15; // degrees the record is rotated so its cover edge shows
const EDGE = 40; // px depth of the fore-edge cover slice

/**
 * A single record seen edge-on in the crate — now a real 3D object: the
 * colored, labeled spine plus a receding slice of the actual cover art at its
 * opening edge. At rest it sits turned on the shelf; on hover/focus it swings
 * square to the viewer and pulls forward, the way you'd draw one out to read it.
 */
export default function VinylSpine({
  album,
  onSelect,
}: {
  album: Album;
  onSelect: (album: Album) => void;
}) {
  const base = album.spineColor ?? DEFAULT_SPINE;
  const typographic = !album.coverUrl;
  const reduce = useReducedMotion();

  // With reduced motion we drop the 3D turn entirely and fall back to the old
  // flat spine + straight lift, so nothing swings or foreshortens.
  const rest = { rotateY: reduce ? 0 : -TILT, scale: 1, y: 0, zIndex: 0 };
  const lift = reduce
    ? { rotateY: 0, scale: 1, y: -11, zIndex: 30 }
    : { rotateY: -3, scale: 1.06, y: -8, zIndex: 30 };

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(album)}
      aria-label={`${album.title} by ${album.artist}`}
      className="group relative h-[440px] w-[32px] shrink-0 rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-amber"
      style={{ transformStyle: "preserve-3d" }}
      variants={{ rest, lift }}
      initial="rest"
      animate="rest"
      whileHover="lift"
      whileFocus="lift"
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
    >
      {/* the warm glow that bleeds up from beneath the lifted record */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-2 -bottom-3 top-1/2 -z-10 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(200,131,42,0.55), transparent 70%)",
        }}
      />

      {/* the opening edge: a thin slice of the real cover receding into the
          shelf, hinged at the spine's left edge. Invisible when reduced motion
          keeps the record square (it sits perpendicular to the viewer). */}
      {!typographic && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden rounded-l-[2px]"
          style={{
            width: EDGE,
            transformOrigin: "left center",
            transform: "rotateY(90deg)",
            backgroundImage: `url(${album.coverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "right center",
            filter: "brightness(0.72) saturate(0.95)",
            boxShadow: "inset -8px 0 14px -6px rgba(0,0,0,0.7)",
          }}
        />
      )}

      {/* the spine face */}
      <span
        className="relative flex h-full w-full overflow-hidden rounded-[3px]"
        style={{
          backgroundColor: base,
          // rounded-spine sheen (across) over a top-lit → shadowed body (down)
          backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 14%, transparent 32%, rgba(0,0,0,0.18) 88%, rgba(0,0,0,0.34) 100%), ${spineGradient(base)}`,
          boxShadow:
            // top sheen + foot shadow, side ambient-occlusion so neighbours
            // nestle, and a faint warm rim on the lamp-facing (left) edge
            "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.4), inset 5px 0 7px -6px rgba(0,0,0,0.55), inset -5px 0 7px -6px rgba(0,0,0,0.6), inset 1px 0 0 rgba(200,131,42,0.10), 0 10px 22px -12px rgba(0,0,0,0.8)",
        }}
      >
        {/* printed-cardboard fibre, blended so it only textures the color */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-soft-light"
          style={{ backgroundImage: PAPER_NOISE, backgroundRepeat: "repeat" }}
        />

        {/* faint sleeve grooves */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[3px] w-px"
          style={{ background: "rgba(0,0,0,0.25)" }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-[4px] w-px"
          style={{ background: "rgba(0,0,0,0.25)" }}
        />

        <SpineLabel album={album} typographic={typographic} />

        {/* resting shadow: records sit in low light and only brighten when
            pulled toward the candle (hover/focus) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[3px] bg-black/45 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0"
        />
      </span>
    </motion.button>
  );
}
