"use client";

import { motion } from "framer-motion";
import type { Album } from "@/lib/types";
import AlbumCover from "@/components/album/AlbumCover";

/**
 * A featured record turned face-out in the row — the same physical record as
 * a spine, just rotated to show its sleeve. Stands the full height of the
 * shelf and rests on the same ledge as the spines beside it.
 */
export default function FaceOutRecord({
  album,
  onSelect,
}: {
  album: Album;
  onSelect: (album: Album) => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(album)}
      aria-label={`${album.title} by ${album.artist}`}
      className="group relative h-[440px] w-[440px] shrink-0 origin-bottom self-end outline-none"
      initial={false}
      whileHover={{ y: -11, scale: 1.01 }}
      whileFocus={{ y: -11, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
    >
      {/* warm bloom behind a lifted sleeve */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(200,131,42,0.45), transparent 70%)",
        }}
      />
      <AlbumCover album={album} className="h-full" />
      {/* the dim resting light, lifted off when pulled toward the lamp */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2px] bg-black/40 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0"
      />
    </motion.button>
  );
}
