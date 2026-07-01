"use client";

import { SpotifyPlayerProvider } from "./player/SpotifyPlayerContext";
import { AmbientProvider } from "./ambient/AmbientProvider";
import { RoomStageProvider } from "./ambient/RoomStageProvider";
import { RoomLightProvider } from "./ambient/RoomLightProvider";
import AmbientAudio from "./ambient/AmbientAudio";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SpotifyPlayerProvider>
      <AmbientProvider>
        <RoomLightProvider>
          <RoomStageProvider>
            {children}
            {/* persistent, view-independent ambience — renders no DOM */}
            <AmbientAudio />
          </RoomStageProvider>
        </RoomLightProvider>
      </AmbientProvider>
    </SpotifyPlayerProvider>
  );
}
