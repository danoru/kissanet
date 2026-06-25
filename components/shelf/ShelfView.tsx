"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Album } from "@/lib/types";
import VinylSpine from "./VinylSpine";
import FaceOutRecord from "./FaceOutRecord";
import AlbumCover from "@/components/album/AlbumCover";
import AlbumDetails from "@/components/album/AlbumDetails";
import RecordPlayer from "@/components/player/RecordPlayer";
import NowPlaying from "@/components/player/NowPlaying";
import { useSpotify } from "@/components/player/SpotifyPlayerContext";

type View = "shelf" | "pulled" | "playing";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

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

          {/* the records — spine-on, with featured ones turned face-out in
              place. They stand directly on the ledge below, no scroll. */}
          <div className="relative">
            <div className="relative flex items-end gap-[3px]">
              {items.map((album) =>
                album.featured ? (
                  <FaceOutRecord key={album.id} album={album} onSelect={open} />
                ) : (
                  <VinylSpine key={album.id} album={album} onSelect={open} />
                ),
              )}

              {/* a leaning wooden bookend — the crate has room for more */}
              <div
                aria-hidden
                className="wood-grain ml-1 h-[150px] w-3 shrink-0 origin-bottom -rotate-[6deg] self-end rounded-sm"
                style={{
                  backgroundColor: "rgb(var(--color-wood))",
                  boxShadow:
                    "inset 1px 0 0 rgb(var(--color-wood-hi) / 0.35), 0 8px 16px -10px rgba(0,0,0,0.9)",
                }}
              />
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
