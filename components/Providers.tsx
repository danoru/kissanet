"use client";

import { SpotifyPlayerProvider } from "./player/SpotifyPlayerContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SpotifyPlayerProvider>{children}</SpotifyPlayerProvider>;
}
