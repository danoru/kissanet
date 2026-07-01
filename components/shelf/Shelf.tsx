"use client";

import type { Album } from "@/lib/types";
import VinylSpine from "./VinylSpine";
import FaceOutRecord from "./FaceOutRecord";

/**
 * A single wooden shelf: a row of records standing on a ledge. Featured
 * records turn face-out in place; the rest are spine-on. When the shelf is
 * part of a zoomed-out overview it's rendered non-interactive, so the whole
 * shelf reads as one click target instead of a row of tiny buttons.
 */
export default function Shelf({
  albums,
  onSelect,
  showBookend = false,
  interactive = true,
}: {
  albums: Album[];
  onSelect: (album: Album) => void;
  showBookend?: boolean;
  interactive?: boolean;
}) {
  return (
    <div className="relative">
      {/* the records — spine-on, with featured ones turned face-out in place.
          The row carries the perspective so each spine can turn to show a
          slice of its cover; origin sits left-of-centre to match the lamp. */}
      <div
        className={`relative flex items-end gap-[3px] ${
          interactive ? "" : "pointer-events-none"
        }`}
        style={{ perspective: "1600px", perspectiveOrigin: "35% 45%" }}
      >
        {albums.map((album) =>
          album.featured ? (
            <FaceOutRecord key={album.id} album={album} onSelect={onSelect} />
          ) : (
            <VinylSpine key={album.id} album={album} onSelect={onSelect} />
          ),
        )}

        {/* a leaning wooden bookend — the crate has room for more */}
        {showBookend && (
          <div
            aria-hidden
            className="wood-grain ml-1 h-[150px] w-3 shrink-0 origin-bottom -rotate-[6deg] self-end rounded-sm"
            style={{
              backgroundColor: "rgb(var(--color-wood))",
              boxShadow:
                "inset 1px 0 0 rgb(var(--color-wood-hi) / 0.35), 0 8px 16px -10px rgba(0,0,0,0.9)",
            }}
          />
        )}
      </div>

      {/* the wooden ledge the records stand on */}
      <div
        className="wood-grain-h h-3 w-full rounded-sm"
        style={{
          backgroundColor: "rgb(var(--color-wood))",
          boxShadow:
            "inset 0 1px 0 rgb(var(--color-wood-hi) / 0.5), 0 14px 30px -16px rgba(0,0,0,0.9)",
        }}
      />

      {/* faint reflection of the spines on the polished ledge, then shadow */}
      <div
        aria-hidden
        className="pointer-events-none -mt-px h-10 w-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(200,131,42,0.05), transparent 70%), linear-gradient(180deg, rgba(0,0,0,0.5), transparent 80%)",
        }}
      />
    </div>
  );
}
