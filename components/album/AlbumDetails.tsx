import type { Album } from "@/lib/types";

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="text-amber" aria-label={`${rating} out of 5`}>
      {"★".repeat(rating)}
      <span className="text-groove">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

/**
 * The little card of metadata that sits with a pulled-out record: artist,
 * title, the catalogue line, personal liner notes, and mood tags.
 */
export default function AlbumDetails({ album }: { album: Album }) {
  const catalogue = [album.year, album.genre, album.subgenre]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-5 text-left">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
          {album.artist}
        </p>
        <h2 className="mt-1 font-display text-4xl font-medium leading-tight text-cream md:text-5xl">
          {album.title}
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] tracking-[0.15em] text-muted">
        {catalogue && <span>{catalogue}</span>}
        <Stars rating={album.rating} />
      </div>

      {album.notes && (
        <p className="max-w-md font-display text-xl italic leading-relaxed text-cream/85">
          “{album.notes}”
        </p>
      )}

      {album.mood.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {album.mood.map((m) => (
            <li
              key={m}
              className="rounded-full border border-groove px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted"
            >
              {m}
            </li>
          ))}
        </ul>
      )}

      {(album.playCount > 0 || album.lastPlayedAt) && (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70">
          played {album.playCount}×
          {album.lastPlayedAt
            ? ` · last spun ${new Date(album.lastPlayedAt).toLocaleDateString(
                undefined,
                { month: "short", day: "numeric" },
              )}`
            : ""}
        </p>
      )}
    </div>
  );
}
