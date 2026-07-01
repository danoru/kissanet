"use client";

import { useAmbient } from "./AmbientProvider";

/**
 * The two room controls that sit with the light switch in the corner: a sound
 * toggle (the vinyl/rain bed) and a weather toggle (rain ⇄ clear). Styled to
 * match RoomLight's corner pill. When sound is off, its dot breathes to invite
 * a first-time visitor to turn the room on.
 */
export default function AmbientControls() {
  const { soundOn, weather, toggleSound, toggleWeather } = useAmbient();

  const pill =
    "flex items-center gap-2 rounded-full border border-wood-hi/40 bg-room/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted backdrop-blur transition-colors hover:border-amber/50 hover:text-cream";

  return (
    <div className="fixed bottom-[76px] right-6 z-40 flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? "Mute the room" : "Turn on the room sound"}
        className={pill}
      >
        <span
          className={`h-2 w-2 rounded-full transition-colors ${
            soundOn
              ? "bg-amber shadow-[0_0_8px_rgba(200,131,42,0.8)]"
              : "animate-pulse bg-amber/50"
          }`}
        />
        {soundOn ? "sound on" : "sound off"}
      </button>

      <button
        type="button"
        onClick={toggleWeather}
        aria-pressed={weather === "rain"}
        aria-label={
          weather === "rain" ? "Clear the weather" : "Bring the rain"
        }
        className={pill}
      >
        <span
          className={`h-2 w-2 rounded-full transition-colors ${
            weather === "rain"
              ? "bg-[#9fbbe0] shadow-[0_0_8px_rgba(159,187,224,0.7)]"
              : "bg-muted/40"
          }`}
        />
        {weather === "rain" ? "rain" : "clear"}
      </button>
    </div>
  );
}
