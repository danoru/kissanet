"use client";

import { useAmbient } from "./AmbientProvider";
import { useRoomStage } from "./RoomStageProvider";
import { useRoomLight } from "./RoomLightProvider";
import CityWindow from "./CityWindow";
import HornSpeaker from "./HornSpeaker";

/**
 * The room as one coherent perspective box (geometry in lib/room.ts): a back
 * wall the cabinet stands against, side walls carrying the city windows, a
 * plank floor with a rug, and a low ceiling — every surface a 2D trapezoid
 * whose edges meet at the same vanishing point, so nothing can disagree.
 *
 * Two fixed layers:
 *   • z-0  — the surfaces + horn speakers; they darken with the room.
 *   • z-26 — the windows (and their light spill), drawn ABOVE the lights-off
 *     darkness so the city genuinely glows through when the lamp goes out.
 * When the viewer steps in close (a record's pop-up open) the box dollies
 * toward the vanishing point and fades — the camera walking up to the wall.
 */

// shorthand for the shared geometry set on <body> by app/layout.tsx
const L = "var(--room-bw-l)";
const R = "var(--room-bw-r)";
const T = "var(--room-bw-t)";
const B = "var(--room-bw-b)";
const VP = "var(--room-vp-x) var(--room-vp-y)";

const LEFT_WALL = `polygon(0 0, ${L} ${T}, ${L} ${B}, 0 100vh)`;
const RIGHT_WALL = `polygon(100vw 0, 100vw 100vh, ${R} ${B}, ${R} ${T})`;

// plank seams / ceiling boards radiating from the vanishing point — exactly
// the direction true perspective would send them; each surface clips its own.
const seams = (strength: number, gap: number) =>
  `repeating-conic-gradient(from 0deg at ${VP}, rgba(0,0,0,${strength}) 0deg 0.5deg, transparent 0.5deg ${gap}deg)`;

export default function RoomShell() {
  const { weather } = useAmbient();
  const { closeUp } = useRoomStage();
  const { on } = useRoomLight();

  // the dolly-in when a record pop-up opens
  const dolly = {
    transform: closeUp ? "scale(1.09)" : "scale(1)",
    opacity: closeUp ? 0.25 : 1,
    transformOrigin: VP,
  };
  const ease = "transition-all duration-700 ease-out";

  return (
    <>
      {/* ---------- THE BOX — behind everything, darkens with the room ---------- */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 hidden select-none overflow-hidden lg:block"
      >
        <div className={`absolute inset-0 ${ease}`} style={dolly}>
          {/* ceiling — low and dark, boards converging on the back wall */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: `polygon(0 0, 100vw 0, ${R} ${T}, ${L} ${T})`,
              background: `radial-gradient(ellipse 42% 16% at 32% ${T}, rgba(200,131,42,0.10), transparent 70%), ${seams(0.4, 7)}, linear-gradient(180deg, #050403 0%, #0e0b07 78%, #141009 100%)`,
            }}
          />

          {/* left wall — dark paneling warmed by the lamp near the front */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: LEFT_WALL,
              background: `radial-gradient(ellipse 30vw 42vh at 3vw 28vh, rgba(200,131,42,0.12), transparent 72%), repeating-linear-gradient(90deg, rgba(0,0,0,0.22) 0 2px, transparent 2px 3.2vw), linear-gradient(90deg, #221a12 0%, #171009 55%, #0a0705 100%)`,
            }}
          />

          {/* right wall */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: RIGHT_WALL,
              background: `radial-gradient(ellipse 26vw 40vh at 97vw 34vh, rgba(160,110,45,0.07), transparent 72%), repeating-linear-gradient(90deg, rgba(0,0,0,0.22) 0 2px, transparent 2px 3.2vw), linear-gradient(270deg, #1e160f 0%, #151009 55%, #0a0705 100%)`,
            }}
          />

          {/* back wall — wood paneling the cabinet stands against */}
          <div
            className="wood-grain absolute"
            style={{
              left: L,
              top: T,
              width: `calc(${R} - ${L})`,
              height: `calc(${B} - ${T})`,
              backgroundColor: "#26190f",
              boxShadow:
                "inset 0 0 110px rgba(0,0,0,0.7), inset 0 -20px 32px -16px rgba(0,0,0,0.9), inset 0 12px 26px -12px rgba(0,0,0,0.85), inset 18px 0 30px -18px rgba(0,0,0,0.8), inset -18px 0 30px -18px rgba(0,0,0,0.8)",
            }}
          >
            {/* board seams + a picture rail near the top */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "repeating-linear-gradient(90deg, rgba(0,0,0,0.26) 0 1px, transparent 1px 46px)",
              }}
            />
            <div
              className="absolute inset-x-0"
              style={{
                top: "8%",
                height: 3,
                background:
                  "linear-gradient(180deg, rgba(130,94,55,0.45), rgba(0,0,0,0.6))",
              }}
            />
            {/* the lamp's warmth pooling on the wall, upper left */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 55% 45% at 22% 12%, rgba(200,131,42,0.14), transparent 70%)",
              }}
            />
          </div>

          {/* floor — planks running toward the back wall, darkest at our feet */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: `polygon(0 100vh, ${L} ${B}, ${R} ${B}, 100vw 100vh)`,
              background: `linear-gradient(180deg, rgba(0,0,0,0.55) calc(${B} + 1px), transparent calc(${B} + 5vh)), radial-gradient(ellipse 44% 16% at 34% ${B}, rgba(200,131,42,0.11), transparent 70%), ${seams(0.35, 4.5)}, linear-gradient(180deg, #1d130b 0%, #150e08 45%, #0a0705 100%)`,
            }}
          />

          {/* a dim rug on the floor, sides following the vanishing point */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: `polygon(36vw calc(${B} + 2.5vh), 64vw calc(${B} + 2.5vh), 69vw 96vh, 31vw 96vh)`,
              background:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0 1px, transparent 1px 5px), linear-gradient(180deg, #371712 0%, #2a110d 55%, #1c0b08 100%)",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.6)",
            }}
          >
            {/* woven border band */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: `polygon(37.5vw calc(${B} + 3.6vh), 62.5vw calc(${B} + 3.6vh), 67vw 94.6vh, 33vw 94.6vh)`,
                boxShadow: "inset 0 0 0 2px rgba(180,120,70,0.18)",
              }}
            />
          </div>

          {/* the cabinet's contact shadow where it meets the floor */}
          <div
            className="absolute"
            style={{
              left: "25vw",
              width: "50vw",
              top: `calc(${B} - 1vh)`,
              height: "4.5vh",
              background:
                "radial-gradient(ellipse 50% 55% at 50% 25%, rgba(0,0,0,0.6), transparent 72%)",
              filter: "blur(6px)",
            }}
          />

          {/* horn speakers flanking the cabinet, toed into the back corners */}
          <div
            className="absolute"
            style={{
              left: `calc(${L} - 4.5vw)`,
              bottom: `calc(100vh - ${B} - 5vh)`,
              width: "11vw",
              height: "46vh",
            }}
          >
            <HornSpeaker side="left" />
          </div>
          <div
            className="absolute"
            style={{
              right: `calc(100vw - ${R} - 4.5vw)`,
              bottom: `calc(100vh - ${B} - 5vh)`,
              width: "11vw",
              height: "46vh",
            }}
          >
            <HornSpeaker side="right" />
          </div>
        </div>
      </div>

      {/* ---------- WINDOWS — above the lights-off darkness (z-26) ---------- */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[26] hidden select-none overflow-hidden lg:block"
      >
        <div className={`absolute inset-0 ${ease}`} style={dolly}>
          {/* cool light spilling from the panes onto each wall */}
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              clipPath: LEFT_WALL,
              opacity: on ? 0.45 : 0.32,
              background:
                "radial-gradient(ellipse 14vw 26vh at 7vw 42vh, rgba(140,170,210,0.20), transparent 72%)",
            }}
          />
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              clipPath: RIGHT_WALL,
              opacity: on ? 0.45 : 0.32,
              background:
                "radial-gradient(ellipse 14vw 26vh at 93vw 42vh, rgba(140,170,210,0.20), transparent 72%)",
            }}
          />

          {/* the panes, turned into their walls */}
          <div
            className="absolute"
            style={{
              left: "1.5vw",
              top: "23vh",
              width: "13vw",
              height: "36vh",
              transform: "perspective(1100px) rotateY(36deg)",
              transformOrigin: "left center",
            }}
          >
            <CityWindow side="left" weather={weather} lit={on} />
          </div>
          <div
            className="absolute"
            style={{
              right: "1.5vw",
              top: "23vh",
              width: "13vw",
              height: "36vh",
              transform: "perspective(1100px) rotateY(-36deg)",
              transformOrigin: "right center",
            }}
          >
            <CityWindow side="right" weather={weather} lit={on} />
          </div>
        </div>
      </div>
    </>
  );
}
