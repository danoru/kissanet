"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/* ------- minimal Spotify Web Playback SDK typings (what we use) ------- */
type SpotifyTrack = { name: string; artists: { name: string }[] };
type SpotifyState = {
  paused: boolean;
  position: number;
  duration: number;
  track_window: { current_track: SpotifyTrack };
};
type SpotifyPlayer = {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  togglePlay: () => Promise<void>;
  pause: () => Promise<void>;
  getCurrentState: () => Promise<SpotifyState | null>;
  addListener: (event: string, cb: (arg: unknown) => void) => void;
};
declare global {
  interface Window {
    Spotify?: {
      Player: new (opts: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayer;
    };
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

type Status = "loading" | "unconfigured" | "disconnected" | "ready";

type Ctx = {
  status: Status;
  isPlaying: boolean;
  track: string | null;
  artist: string | null;
  position: number;
  duration: number;
  connect: () => void;
  playAlbum: (uri: string) => Promise<void>;
  toggle: () => void;
  pause: () => void;
};

const PlayerContext = createContext<Ctx | null>(null);

export function useSpotify() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("useSpotify must be used within SpotifyPlayerProvider");
  return ctx;
}

async function fetchToken(): Promise<{
  configured: boolean;
  connected: boolean;
  accessToken?: string;
}> {
  const res = await fetch("/api/spotify/token", { cache: "no-store" });
  return res.json();
}

export function SpotifyPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [isPlaying, setIsPlaying] = useState(false);
  const [track, setTrack] = useState<string | null>(null);
  const [artist, setArtist] = useState<string | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const playerRef = useRef<SpotifyPlayer | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  // Decide initial status, and if connected, boot the SDK once.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const info = await fetchToken();
      if (cancelled) return;
      if (!info.configured) return setStatus("unconfigured");
      if (!info.connected || !info.accessToken) return setStatus("disconnected");

      tokenRef.current = info.accessToken;
      loadSdk(() => initPlayer());
    })();

    function loadSdk(onReady: () => void) {
      if (window.Spotify) return onReady();
      window.onSpotifyWebPlaybackSDKReady = onReady;
      if (!document.getElementById("spotify-sdk")) {
        const s = document.createElement("script");
        s.id = "spotify-sdk";
        s.src = "https://sdk.scdn.co/spotify-player.js";
        s.async = true;
        document.body.appendChild(s);
      }
    }

    function initPlayer() {
      if (!window.Spotify || playerRef.current) return;
      const player = new window.Spotify.Player({
        name: "Kissa — listening room",
        volume: 0.8,
        getOAuthToken: async (cb) => {
          const info = await fetchToken();
          if (info.accessToken) {
            tokenRef.current = info.accessToken;
            cb(info.accessToken);
          }
        },
      });
      playerRef.current = player;

      player.addListener("ready", (arg) => {
        deviceIdRef.current = (arg as { device_id: string }).device_id;
        setStatus("ready");
      });
      player.addListener("not_ready", () => setStatus("disconnected"));
      player.addListener("authentication_error", () =>
        setStatus("disconnected"),
      );
      player.addListener("initialization_error", () =>
        setStatus("disconnected"),
      );
      player.addListener("player_state_changed", (arg) => {
        const state = arg as SpotifyState | null;
        if (!state) return;
        setIsPlaying(!state.paused);
        setPosition(state.position);
        setDuration(state.duration);
        const cur = state.track_window?.current_track;
        if (cur) {
          setTrack(cur.name);
          setArtist(cur.artists.map((a) => a.name).join(", "));
        }
      });

      player.connect();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // tick the progress bar forward while playing
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setPosition((p) => (duration ? Math.min(p + 1000, duration) : p));
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying, duration]);

  const connect = useCallback(() => {
    window.location.href = "/api/spotify";
  }, []);

  const playAlbum = useCallback(async (uri: string) => {
    const deviceId = deviceIdRef.current;
    const token = tokenRef.current;
    if (!deviceId || !token) return;
    await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ context_uri: uri }),
      },
    );
  }, []);

  const toggle = useCallback(() => {
    playerRef.current?.togglePlay();
  }, []);

  // a no-op when nothing is connected/playing, so it's always safe to call
  const pause = useCallback(() => {
    playerRef.current?.pause();
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        status,
        isPlaying,
        track,
        artist,
        position,
        duration,
        connect,
        playAlbum,
        toggle,
        pause,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
