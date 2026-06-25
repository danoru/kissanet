"use client";

import { useState } from "react";
import type { Album } from "@/lib/types";
import { DEFAULT_SPINE, readableText } from "@/lib/color";

/**
 * The cover sleeve, large and square. Falls back to a typographic sleeve set
 * in the display serif over the album's own color — never a grey placeholder.
 */
export default function AlbumCover({
  album,
  className = "",
}: {
  album: Album;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const showArt = album.coverUrl && !broken;

  if (showArt) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={album.coverUrl!}
        alt={`${album.title} by ${album.artist}`}
        onError={() => setBroken(true)}
        className={`aspect-square w-full select-none rounded-[2px] object-cover shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85)] ring-1 ring-black/40 ${className}`}
        draggable={false}
      />
    );
  }

  const base = album.spineColor ?? DEFAULT_SPINE;
  const ink = readableText(base);
  return (
    <div
      className={`relative flex aspect-square w-full select-none flex-col justify-between overflow-hidden rounded-[2px] p-7 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85)] ring-1 ring-black/40 ${className}`}
      style={{
        backgroundColor: base,
        backgroundImage:
          "linear-gradient(135deg, rgba(255,255,255,0.08), transparent 45%), linear-gradient(0deg, rgba(0,0,0,0.35), transparent 55%)",
        color: ink,
      }}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.3em] opacity-70">
        {album.artist}
      </span>
      <span className="font-display text-4xl font-medium leading-[1.05] md:text-5xl">
        {album.title}
      </span>
      <span className="font-mono text-[11px] tracking-[0.25em] opacity-60">
        {album.year ?? ""}
      </span>
    </div>
  );
}
