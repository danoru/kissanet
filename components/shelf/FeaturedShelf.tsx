"use client";

import { motion } from "framer-motion";
import type { Album } from "@/lib/types";
import AlbumCover from "@/components/album/AlbumCover";

/**
 * The top shelf: a handful of records stood face-out on a wooden ledge,
 * leaning back the way sleeves do when they're propped up to be admired.
 * Clicking one pulls it, same as a spine.
 */
export default function FeaturedShelf({
  albums,
  onSelect,
}: {
  albums: Album[];
  onSelect: (album: Album) => void;
}) {
  if (albums.length === 0) return null;

  return (
    <div className="relative">
      {/* the records, propped on the ledge */}
      <div className="flex items-end gap-5 overflow-x-auto px-2 pb-1 pt-2">
        {albums.map((album, i) => {
          // a casual alternating lean so the row doesn't look ruler-straight
          const tilt = (i % 2 === 0 ? -1 : 1) * (1 + (i % 3) * 0.6);
          return (
            <motion.button
              key={album.id}
              type="button"
              onClick={() => onSelect(album)}
              aria-label={`${album.title} by ${album.artist}`}
              className="group relative w-[120px] shrink-0 origin-bottom outline-none md:w-[140px]"
              style={{ rotate: `${tilt}deg` }}
              initial={false}
              whileHover={{ y: -8, rotate: 0, scale: 1.03 }}
              whileFocus={{ y: -8, rotate: 0, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              {/* warm bloom behind a lifted sleeve */}
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-3 -z-10 rounded-xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(200,131,42,0.5), transparent 70%)",
                }}
              />
              <AlbumCover
                album={album}
                className="ring-black/50 transition-shadow duration-300 group-hover:shadow-[0_24px_50px_-18px_rgba(0,0,0,0.9)]"
              />
              {/* the dim resting light, lifted off when pulled toward the lamp */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[2px] bg-black/35 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0"
              />
            </motion.button>
          );
        })}
      </div>

      {/* the ledge the sleeves stand on */}
      <div
        className="wood-grain-h h-3 w-full rounded-sm"
        style={{
          backgroundColor: "rgb(var(--color-wood))",
          boxShadow:
            "inset 0 1px 0 rgb(var(--color-wood-hi) / 0.5), 0 14px 30px -16px rgba(0,0,0,0.9)",
        }}
      />
      {/* shadow the sleeves cast down the shelf below */}
      <div
        aria-hidden
        className="pointer-events-none -mt-px h-8 w-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.45), transparent 85%)",
        }}
      />
    </div>
  );
}
