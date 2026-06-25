"use client";

import { motion } from "framer-motion";
import type { Album } from "@/lib/types";
import { DEFAULT_SPINE } from "@/lib/color";
import SpineLabel from "./SpineLabel";

/**
 * A single record seen edge-on in the crate. Colored by its extracted
 * spineColor, with a soft sheen down the rounded edge and a couple of
 * sleeve grooves. Lifts on hover with a warm glow bleeding from beneath.
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

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(album)}
      aria-label={`${album.title} by ${album.artist}`}
      className="group relative h-[440px] w-[44px] shrink-0 rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-amber"
      initial={false}
      whileHover={{ y: -11 }}
      whileFocus={{ y: -11 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
    >
      {/* the warm glow that bleeds up from beneath the lifted spine */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-2 -bottom-3 top-1/2 -z-10 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(200,131,42,0.55), transparent 70%)",
        }}
      />

      <span
        className="relative flex h-full w-full overflow-hidden rounded-[3px]"
        style={{
          backgroundColor: base,
          // rounded-spine sheen + a touch of depth toward the right edge
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 14%, transparent 32%, rgba(0,0,0,0.18) 88%, rgba(0,0,0,0.34) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.4), 0 10px 22px -12px rgba(0,0,0,0.8)",
        }}
      >
        {/* faint sleeve grooves */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[4px] w-px"
          style={{ background: "rgba(0,0,0,0.25)" }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-[5px] w-px"
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
