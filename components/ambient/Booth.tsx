"use client";

import { useRoomStage } from "./RoomStageProvider";

/**
 * The foreground of the shot: you're seated in a booth. A dark table edge
 * runs along the bottom of the frame and a tufted-leather booth back rises
 * at each side — slightly blurred, like anything that close to the camera.
 * Pure silhouette, no props; it slides out of frame when the viewer leans
 * in close (a record pop-up open). Sits below the lights-off darkness so it
 * goes dark with the room.
 */

function BoothBack({ side }: { side: "left" | "right" }) {
  return (
    <div
      className="absolute bottom-[7vh]"
      style={{
        [side]: "-3vw",
        width: "17vw",
        height: "30vh",
        borderRadius: side === "left" ? "16px 26px 0 0" : "26px 16px 0 0",
        background:
          "radial-gradient(ellipse 120% 55% at 50% -8%, rgba(214,160,96,0.10), transparent 60%), linear-gradient(165deg, #2a1a10 0%, #190f08 55%, #0c0704 100%)",
        boxShadow:
          "inset 0 2px 0 rgba(220,170,110,0.10), inset 0 -34px 50px -30px rgba(0,0,0,0.9), 0 -12px 40px -12px rgba(0,0,0,0.7)",
        filter: "blur(2px)",
      }}
    >
      {/* leather tufting */}
      <div
        className="absolute inset-4 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.55) 1.5px, rgba(130,88,50,0.14) 2.5px, transparent 4px)",
          backgroundSize: "42px 34px",
        }}
      />
    </div>
  );
}

export default function Booth() {
  const { closeUp } = useRoomStage();

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[18] hidden select-none transition-all duration-700 ease-out lg:block"
      style={{
        transform: closeUp ? "translateY(75%)" : "translateY(0)",
        opacity: closeUp ? 0 : 1,
      }}
    >
      <BoothBack side="left" />
      <BoothBack side="right" />

      {/* the table edge we're sitting at, catching a sliver of lamp light */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "10vh",
          filter: "blur(1px)",
          background:
            "linear-gradient(180deg, rgba(255,190,110,0.22) 0, rgba(96,62,34,0.9) 3px, #1c1107 14%, #0e0804 55%, #070401 100%)",
          boxShadow: "0 -20px 44px -14px rgba(0,0,0,0.85)",
        }}
      >
        <div className="wood-grain-h absolute inset-0 opacity-25" />
      </div>
    </div>
  );
}
