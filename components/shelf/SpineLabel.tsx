import type { Album } from "@/lib/types";
import { readableText, DEFAULT_SPINE } from "@/lib/color";

/**
 * The text printed down the spine — artist near the foot, title rising above it,
 * reading bottom-to-top the way a record sleeve sits in a crate.
 * When there is no artwork at all, the title is set large in the display serif
 * so the spine reads as a typographic object rather than a blank box.
 */
export default function SpineLabel({
  album,
  typographic = false,
}: {
  album: Album;
  typographic?: boolean;
}) {
  const ink = readableText(album.spineColor ?? DEFAULT_SPINE);

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-between py-5"
      style={{
        color: ink,
        writingMode: "vertical-rl",
        transform: "rotate(180deg)",
      }}
    >
      {/* foot of the spine: catalogue-style year */}
      <span className="font-mono text-[9px] tracking-[0.25em] opacity-60">
        {album.year ?? "——"}
      </span>

      <div className="flex flex-col items-center gap-3">
        <span
          className={
            typographic
              ? "font-display text-2xl font-medium leading-none"
              : "font-display text-lg font-medium leading-none"
          }
          style={{ letterSpacing: "0.01em" }}
        >
          {album.title}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-75">
          {album.artist}
        </span>
      </div>

      <span className="text-xs opacity-50">♪</span>
    </div>
  );
}
