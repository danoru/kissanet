"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Album } from "@/lib/types";
import VinylSpine from "./VinylSpine";
import FaceOutRecord from "./FaceOutRecord";
import Cabinet from "./Cabinet";
import HiFiBay from "./HiFiBay";
import CabinetBase from "./CabinetBase";
import AlbumCover from "@/components/album/AlbumCover";
import AlbumDetails from "@/components/album/AlbumDetails";
import { useSpotify } from "@/components/player/SpotifyPlayerContext";
import { useRoomStage } from "@/components/ambient/RoomStageProvider";
import { backWall } from "@/lib/room";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// physical record widths (px, full-size) used to pack rows
const SPINE_W = 32;
const FACE_W = 440;
const GAP = 3;
// records are drawn full size then each bay is scaled to sit in the cabinet
const BAY_SCALE = 0.42;

/**
 * Greedily lay records left-to-right, wrapping to a new row at the edge.
 * Featured records are wide (face-out in place) — they take FACE_W right where
 * they sit, the rest are thin spines.
 */
function packShelves(items: Album[], width: number): Album[][] {
  if (items.length === 0) return [];
  if (width <= 0) return [items];
  const rows: Album[][] = [];
  let cur: Album[] = [];
  let used = 0;
  for (const a of items) {
    const w = a.featured ? FACE_W : SPINE_W;
    if (cur.length > 0 && used + GAP + w > width) {
      rows.push(cur);
      cur = [a];
      used = w;
    } else {
      used += (cur.length > 0 ? GAP : 0) + w;
      cur.push(a);
    }
  }
  if (cur.length) rows.push(cur);
  return rows;
}

/** A record row drawn full-size, then scaled down to sit on a cabinet shelf. */
function Bay({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative px-1">
      <div className="relative" style={{ height: Math.round(440 * BAY_SCALE) }}>
        <div
          className="absolute bottom-0 left-0"
          style={{ transform: `scale(${BAY_SCALE})`, transformOrigin: "bottom left" }}
        >
          <div
            className="flex items-end gap-[3px]"
            style={{ perspective: "1600px", perspectiveOrigin: "35% 45%" }}
          >
            {children}
          </div>
        </div>
      </div>
      <div
        className="wood-grain-h h-3.5 w-full rounded-sm"
        style={{
          backgroundColor: "rgb(var(--color-wood))",
          boxShadow:
            "inset 0 1px 0 rgb(var(--color-wood-hi) / 0.5), 0 12px 24px -14px rgba(0,0,0,0.9)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none -mt-px h-6 w-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(200,131,42,0.05), transparent 70%), linear-gradient(180deg, rgba(0,0,0,0.45), transparent 85%)",
        }}
      />
    </div>
  );
}

export default function ShelfView({ albums }: { albums: Album[] }) {
  const spotify = useSpotify();
  const spotifyReady = spotify.status === "ready";
  const { setCloseUp } = useRoomStage();

  const [items, setItems] = useState<Album[]>(albums);
  useEffect(() => setItems(albums), [albums]);

  const [selected, setSelected] = useState<Album | null>(null); // the pop-up
  const [nowPlaying, setNowPlaying] = useState<Album | null>(null); // on the deck
  const [localPlaying, setLocalPlaying] = useState(false);
  const playing = spotifyReady ? spotify.isPlaying : localPlaying;

  // measure the cabinet interior to pack rows (accounting for the bay scale)
  const contentRef = useRef<HTMLDivElement>(null);
  const [shelfWidth, setShelfWidth] = useState(0);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setShelfWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // pin the cabinet's feet to the room's floor line (where the back wall
  // meets the floor — see lib/room.ts), scaling it down if the space between
  // the header and that line is short. Keeps the scene inside the viewport.
  const stageRef = useRef<HTMLDivElement>(null);
  const [availH, setAvailH] = useState(0);
  useEffect(() => {
    const measure = () => {
      const top = stageRef.current?.getBoundingClientRect().top ?? 0;
      setAvailH(Math.max(320, window.innerHeight * backWall.bottom - top));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const cabinetRef = useRef<HTMLDivElement>(null);
  const [natH, setNatH] = useState(0);
  useEffect(() => {
    const el = cabinetRef.current;
    if (!el) return;
    const measure = () => setNatH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const fit = natH > 0 && availH > 0 ? Math.min(1, availH / natH) : 1;

  const rows = useMemo(
    () => packShelves(items, shelfWidth / BAY_SCALE),
    [items, shelfWidth],
  );

  const open = useCallback((album: Album) => setSelected(album), []);
  const closePopup = useCallback(() => setSelected(null), []);

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

  const putItOn = useCallback(
    (album: Album) => {
      setNowPlaying(album);
      setLocalPlaying(true);
      setSelected(null);
      fetch(`/api/albums/${album.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "played" }),
      }).catch(() => {});
      if (spotifyReady && album.spotifyId) {
        spotify.playAlbum(album.spotifyId).catch(() => {});
      }
    },
    [spotifyReady, spotify],
  );

  const toggle = useCallback(() => {
    if (spotifyReady) spotify.toggle();
    else setLocalPlaying((p) => !p);
  }, [spotifyReady, spotify]);

  // pop-up open ⇒ the room leans in close (side walls pan out)
  useEffect(() => setCloseUp(selected !== null), [selected, setCloseUp]);
  useEffect(() => () => setCloseUp(false), [setCloseUp]);

  // stop playback when we leave the room entirely
  const spotifyPause = spotify.pause;
  useEffect(() => () => spotifyPause(), [spotifyPause]);

  // Esc closes the pop-up
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, closePopup]);

  return (
    <div className="relative">
      <section className="px-6 md:px-10">
        {/* the stage runs from below the header down to the floor line; the
            cabinet stands at its bottom edge, feet on the floor */}
        <div
          ref={stageRef}
          className="flex flex-col justify-end"
          style={{ height: availH || undefined }}
        >
          <div style={{ height: natH ? natH * fit : undefined }}>
            <div
              ref={cabinetRef}
              style={{ transform: `scale(${fit})`, transformOrigin: "top center" }}
            >
            <Cabinet>
              <div ref={contentRef} className="flex flex-col gap-1 md:gap-2">
                {/* record bays — spines with featured records face-out in place */}
                {(rows.length ? rows : [[]]).map((row, i) => (
                  <Bay key={i}>
                    {row.map((a) =>
                      a.featured ? (
                        <FaceOutRecord key={a.id} album={a} onSelect={open} />
                      ) : (
                        <VinylSpine key={a.id} album={a} onSelect={open} />
                      ),
                    )}
                  </Bay>
                ))}

                {/* the hi-fi counter — receiver + turntable, as furniture */}
                <div className="relative px-1 pt-1">
                  <HiFiBay
                    album={nowPlaying}
                    playing={playing}
                    track={spotifyReady ? spotify.track : null}
                    position={spotifyReady ? spotify.position : 0}
                    duration={spotifyReady ? spotify.duration : 0}
                    spotifyConnected={spotifyReady}
                    spotifyStatus={spotify.status}
                    onToggle={toggle}
                    onConnect={spotify.connect}
                  />
                  <div
                    className="mt-2 wood-grain-h h-4 w-full rounded-sm"
                    style={{
                      backgroundColor: "rgb(var(--color-wood))",
                      boxShadow:
                        "inset 0 1px 0 rgb(var(--color-wood-hi) / 0.5), 0 14px 28px -16px rgba(0,0,0,0.9)",
                    }}
                  />
                </div>

                {/* closed lower cabinet */}
                <CabinetBase />
              </div>
            </Cabinet>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- COMPACT DETAILS POP-UP ---------- */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[35] flex items-center justify-center px-6 py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              aria-label="Back to the shelf"
              onClick={closePopup}
              className="absolute inset-0 -z-10 cursor-default bg-room/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="relative flex w-full max-w-2xl flex-col gap-7 rounded-lg border border-wood-hi/25 bg-room/80 p-6 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)] sm:flex-row sm:p-8"
              style={{ backdropFilter: "blur(2px)" }}
            >
              <button
                type="button"
                onClick={closePopup}
                className="absolute right-4 top-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted transition-colors hover:text-cream"
              >
                ✕
              </button>

              <div className="w-[min(60vw,220px)] shrink-0 self-center sm:self-start">
                <AlbumCover album={selected} />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-6">
                <AlbumDetails album={selected} />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <button
                    type="button"
                    onClick={() => putItOn(selected)}
                    className="rounded-full border border-amber/60 px-7 py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-amber transition-all hover:border-amber hover:text-cream hover:shadow-candle-soft"
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
                    ✎ edit
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
