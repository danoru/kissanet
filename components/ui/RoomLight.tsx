"use client";

import RoomLamp from "./RoomLamp";
import DustMotes from "../ambient/DustMotes";
import { useRoomLight } from "../ambient/RoomLightProvider";

/**
 * Drives the wall sconce and drops a warm darkness over the interior when the
 * light's off (records fade to dim silhouettes; the city windows glow through,
 * handled in RoomShell). Two switches: a pull-chain hanging from the lamp on
 * wide screens, and a small always-present toggle in the corner. The on/off
 * state itself lives in RoomLightProvider so the windows can read it too.
 */
export default function RoomLight() {
  const { on, toggle } = useRoomLight();

  return (
    <>
      <RoomLamp on={on} />
      <DustMotes on={on} />

      {/* the dark that settles in when the light's off — records stay just
          visible as silhouettes underneath it */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[25] transition-opacity duration-700"
        style={{
          opacity: on ? 0 : 1,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(0,0,0,0.72), rgba(0,0,0,0.92) 100%)",
        }}
      />

      {/* a brass pull-chain hanging from the shade (wide screens) */}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? "Turn off the light" : "Turn on the light"}
        className="group fixed left-[150px] top-[270px] z-40 hidden flex-col items-center lg:flex"
      >
        <span className="h-7 w-px bg-gradient-to-b from-[#caa45e]/70 to-[#caa45e]/20 transition-all group-hover:h-9" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#caa45e] shadow-[0_0_8px_rgba(202,164,94,0.6)] transition-transform group-active:translate-y-0.5" />
      </button>

      {/* always-present toggle so the light works on every screen size */}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-wood-hi/40 bg-room/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted backdrop-blur transition-colors hover:border-amber/50 hover:text-cream"
      >
        <span
          className={`h-2 w-2 rounded-full transition-colors ${
            on ? "bg-amber shadow-[0_0_8px_rgba(200,131,42,0.8)]" : "bg-muted/40"
          }`}
        />
        {on ? "light on" : "light off"}
      </button>
    </>
  );
}
