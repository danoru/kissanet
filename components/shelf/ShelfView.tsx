"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Album } from "@/lib/types";
import Shelf from "./Shelf";
import AlbumCover from "@/components/album/AlbumCover";
import AlbumDetails from "@/components/album/AlbumDetails";
import RecordPlayer from "@/components/player/RecordPlayer";
import NowPlaying from "@/components/player/NowPlaying";
import { useSpotify } from "@/components/player/SpotifyPlayerContext";

type View = "shelf" | "pulled" | "playing";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// physical record widths (px) used to pack records onto shelves
const SPINE_W = 44;
const FACE_W = 440;
const GAP = 3;
// a full shelf, ledge + reflection included, is ~492px tall
const FULL_TIER = 492;
const TIER_GAP = 18;

/**
 * Greedily lay records left-to-right, starting a new shelf whenever the next
 * record would run off the end of the available width. Featured records are
 * wide (face-out), so a few of them naturally spill onto fresh shelves
 * instead of pushing the first record off the ledge.
 */
function packShelves(items: Album[], width: number): Album[][] {
  if (items.length === 0) return [];
  if (width <= 0) return [items]; // before we've measured, keep it one shelf
  const shelves: Album[][] = [];
  let cur: Album[] = [];
  let used = 0;
  for (const a of items) {
    const w = a.featured ? FACE_W : SPINE_W;
    if (cur.length > 0 && used + GAP + w > width) {
      shelves.push(cur);
      cur = [a];
      used = w;
    } else {
      used += (cur.length > 0 ? GAP : 0) + w;
      cur.push(a);
    }
  }
  if (cur.length) shelves.push(cur);
  return shelves;
}

export default function ShelfView({ albums }: { albums: Album[] }) {
  const reduce = useReducedMotion();
  const spotify = useSpotify();
  const spotifyReady = spotify.status === "ready";
  const spotifyPause = spotify.pause;

  const [view, setView] = useState<View>("shelf");
  const [selected, setSelected] = useState<Album | null>(null);
  // local "spinning in silence" flag for when Spotify isn't connected
  const [localPlaying, setLocalPlaying] = useState(false);
  const playing = spotifyReady ? spotify.isPlaying : localPlaying;

  // Work off a local copy so featuring a record updates the shelf instantly;
  // re-sync if the server data changes underneath us (e.g. after a refresh).
  const [items, setItems] = useState<Album[]>(albums);
  useEffect(() => setItems(albums), [albums]);

  // Records are packed onto as many shelves as they need. When there's more
  // than one, the whole bookcase shrinks to an overview; click a shelf to
  // step closer (zoom it back to full size) and pull a record.
  const contentRef = useRef<HTMLDivElement>(null);
  const [shelfWidth, setShelfWidth] = useState(0);
  const [vh, setVh] = useState(900);
  const [zoomed, setZoomed] = useState<number | null>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setShelfWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const shelves = useMemo(
    () => packShelves(items, shelfWidth),
    [items, shelfWidth],
  );

  // if a repack drops the shelf we were zoomed into, fall back to the overview
  useEffect(() => {
    if (zoomed !== null && zoomed >= shelves.length) setZoomed(null);
  }, [zoomed, shelves.length]);

  const multi = shelves.length > 1;
  const overview = multi && zoomed === null;
  // shrink the stack so every shelf fits the height we have to work with
  const avail = Math.max(360, vh - 300);
  const overviewScale = overview
    ? Math.min(
        0.6,
        Math.max(
          0.2,
          avail / (shelves.length * FULL_TIER + (shelves.length - 1) * TIER_GAP),
        ),
      )
    : 1;

  const toggleFeatured = useCallback((album: Album) => {
    const next = !album.featured;
    setItems((list) =>
      list.map((a) => (a.id === album.id ? { ...a, featured: next } : a)),
    );
    setSelected((s) => (s && s.id === album.id ? { ...s, featured: next } : s));
    fetch(`/api/albums/${album.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "featured", featured: next }),
    }).catch(() => {});
  }, []);

  const open = useCallback((album: Album) => {
    setSelected(album);
    setView("pulled");
  }, []);

  const close = useCallback(() => {
    setView("shelf");
    setLocalPlaying(false);
    // keep `selected` briefly so the exit animation has data, then clear
    setTimeout(() => setSelected(null), 350);
  }, []);

  const putItOn = useCallback(() => {
    if (!selected) return;
    setView("playing");
    setLocalPlaying(true);

    // record that this album was put on (persists only with a database)
    fetch(`/api/albums/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "played" }),
    }).catch(() => {});

    // start real playback when Spotify is connected and we have a URI
    if (spotifyReady && selected.spotifyId) {
      spotify.playAlbum(selected.spotifyId).catch(() => {});
    }
  }, [selected, spotifyReady, spotify]);

  const toggle = useCallback(() => {
    if (spotifyReady) spotify.toggle();
    else setLocalPlaying((p) => !p);
  }, [spotifyReady, spotify]);

  // The record should only play while we're actually on the turntable.
  // Stop playback when the player closes (back to the shelf, Esc, click-away)
  // and when the room unmounts (navigating to another page).
  useEffect(() => {
    if (view !== "playing") spotifyPause();
  }, [view, spotifyPause]);
  useEffect(() => () => spotifyPause(), [spotifyPause]);

  // Esc closes the open record
  useEffect(() => {
    if (view === "shelf") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, close]);

  const overlayOpen = view !== "shelf";

  return (
    <div className="relative">
      {/* ---------- THE SHELF ---------- */}
      <section
        className={`px-8 pb-24 pt-6 transition-all duration-500 md:px-14 ${
          overlayOpen ? "pointer-events-none scale-[0.99] blur-md" : ""
        }`}
        style={{ opacity: overlayOpen ? 0.3 : 1 }}
        aria-hidden={overlayOpen}
      >
        <p className="mb-8 max-w-xl font-display text-2xl italic leading-snug text-muted">
          Pull a record from the shelf. Put it on. Let it play.
        </p>

        {/* the bookcase — recessed wooden cabinetry the records live in */}
        <div
          className="wood-grain relative rounded-lg border border-wood-hi/30 px-5 pt-4 md:px-8 md:pt-6"
          style={{
            backgroundColor: "rgb(var(--color-wood))",
            boxShadow:
              "inset 0 2px 0 rgb(var(--color-wood-hi) / 0.4), inset 0 0 90px -20px rgba(0,0,0,0.9), 0 40px 80px -40px rgba(0,0,0,0.95)",
          }}
        >
          {/* warm light pooled on the back wall of the case */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-lg"
            style={{
              background:
                "radial-gradient(ellipse 55% 60% at 26% 32%, rgba(200,131,42,0.12), transparent 72%)",
            }}
          />

          {/* the records, packed across as many shelves as they need. With
              one shelf they stand full-size; with several, the stack shrinks
              to an overview you can step into shelf by shelf. */}
          <div className="relative" ref={contentRef}>
            {multi && zoomed !== null && (
              <div className="mb-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setZoomed(null)}
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-cream"
                >
                  ← all shelves
                </button>
                <div className="flex items-center gap-2">
                  {shelves.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setZoomed(i)}
                      aria-label={`Shelf ${i + 1}`}
                      aria-current={i === zoomed}
                      className={`h-7 w-7 rounded-full border font-mono text-[10px] transition-colors ${
                        i === zoomed
                          ? "border-amber text-amber"
                          : "border-wood-hi/40 text-muted hover:text-cream"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={overview ? "space-y-[18px]" : ""}>
              {shelves.map((shelf, i) => {
                if (zoomed !== null && zoomed !== i) return null;
                const last = i === shelves.length - 1;

                if (overview) {
                  return (
                    <div
                      key={i}
                      className="relative"
                      style={{ height: FULL_TIER * overviewScale }}
                    >
                      <div
                        style={{
                          transform: `scale(${overviewScale})`,
                          transformOrigin: "top center",
                        }}
                      >
                        <Shelf
                          albums={shelf}
                          onSelect={open}
                          showBookend={last}
                          interactive={false}
                        />
                      </div>
                      {/* the whole shelf is the click target in overview */}
                      <button
                        type="button"
                        onClick={() => setZoomed(i)}
                        aria-label={`Step closer to shelf ${i + 1} of ${shelves.length}`}
                        className="group absolute inset-0 z-10 flex items-end justify-center rounded-lg ring-1 ring-transparent transition-all hover:bg-amber/[0.04] hover:ring-amber/30"
                      >
                        <span className="mb-6 rounded-full bg-room/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                          shelf {i + 1} · step closer
                        </span>
                      </button>
                    </div>
                  );
                }

                return (
                  <Shelf
                    key={i}
                    albums={shelf}
                    onSelect={open}
                    showBookend={last}
                    interactive
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PULLED OUT / PLAYING ---------- */}
      <AnimatePresence>
        {overlayOpen && selected && (
          <motion.div
            className="fixed inset-0 z-[35] flex items-center justify-center px-6 py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* click-away scrim */}
            <button
              type="button"
              aria-label="Back to the shelf"
              onClick={close}
              className="absolute inset-0 -z-10 cursor-default bg-room/70"
            />

            <button
              type="button"
              onClick={close}
              className="absolute right-8 top-8 font-mono text-[11px] uppercase tracking-[0.25em] text-muted transition-colors hover:text-cream"
            >
              ✕ back to the shelf
            </button>

            <motion.div
              layout
              className={`flex w-full max-w-5xl flex-col items-center gap-10 ${
                view === "playing"
                  ? "md:flex-row md:items-center md:justify-center"
                  : ""
              }`}
              transition={{ duration: 0.7, ease: EASE_OUT }}
            >
              {/* the cover */}
              <motion.div
                layout
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, y: 70, scale: 0.82 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="w-[min(78vw,340px)] shrink-0"
              >
                <AlbumCover album={selected} />
              </motion.div>

              {/* right side: details (pulled) or turntable (playing) */}
              <div className="flex w-[min(90vw,420px)] flex-col items-center gap-6">
                <AnimatePresence mode="wait">
                  {view === "pulled" ? (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4, delay: 0.12, ease: EASE_OUT }}
                      className="flex flex-col items-center gap-7"
                    >
                      <AlbumDetails album={selected} />
                      <div className="flex flex-col items-center gap-4">
                        <button
                          type="button"
                          onClick={putItOn}
                          className="group relative rounded-full border border-amber/60 px-8 py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-amber transition-all hover:border-amber hover:text-cream hover:shadow-candle-soft"
                        >
                          ▸ put it on
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFeatured(selected)}
                          className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-cream"
                        >
                          {selected.featured
                            ? "★ featured — turn spine-on"
                            : "☆ stand this one face-out"}
                        </button>
                        <Link
                          href={`/album/${selected.id}/edit`}
                          className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted/70 transition-colors hover:text-cream"
                        >
                          ✎ edit details
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="player"
                      initial={
                        reduce ? { opacity: 0 } : { opacity: 0, x: 40, scale: 0.92 }
                      }
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.7, ease: EASE_OUT }}
                      className="flex w-full flex-col items-center gap-7"
                    >
                      <RecordPlayer album={selected} playing={playing} />
                      <NowPlaying
                        album={selected}
                        playing={playing}
                        track={spotifyReady ? spotify.track : null}
                        position={spotifyReady ? spotify.position : 0}
                        duration={spotifyReady ? spotify.duration : 0}
                        spotifyConnected={spotifyReady}
                        spotifyStatus={spotify.status}
                        onToggle={toggle}
                        onConnect={spotify.connect}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
