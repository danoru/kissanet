import type { Weather } from "./AmbientProvider";

/**
 * A window onto a rainy night city — the only place rain lives now. Deep cool
 * sky, soft out-of-focus lights (bokeh) behind a low skyline of lit buildings,
 * rain running down the glass (weather-gated), a faint glass sheen, and a dark
 * wood frame with mullions. Meant to sit on an angled wall (RoomShell), so it
 * inherits the room's perspective.
 */

type Disc = { left: string; top: string; size: number; color: string; blur: number };
type Building = { w: number; h: number };
type Streak = { left: string; top: string; h: number; w: number; dur: number; delay: number; op: number };

const BOKEH: Disc[] = [
  { left: "20%", top: "28%", size: 26, color: "rgba(255,190,110,0.50)", blur: 10 },
  { left: "60%", top: "20%", size: 20, color: "rgba(150,190,240,0.45)", blur: 9 },
  { left: "38%", top: "44%", size: 34, color: "rgba(255,170,90,0.38)", blur: 15 },
  { left: "74%", top: "38%", size: 18, color: "rgba(190,210,255,0.40)", blur: 8 },
  { left: "12%", top: "50%", size: 22, color: "rgba(255,200,130,0.40)", blur: 12 },
  { left: "50%", top: "32%", size: 15, color: "rgba(255,222,160,0.55)", blur: 6 },
  { left: "86%", top: "26%", size: 16, color: "rgba(255,196,120,0.42)", blur: 9 },
];

const BUILDINGS: Building[] = [
  { w: 12, h: 52 },
  { w: 8, h: 38 },
  { w: 14, h: 66 },
  { w: 9, h: 44 },
  { w: 11, h: 58 },
  { w: 7, h: 34 },
  { w: 13, h: 72 },
  { w: 10, h: 48 },
  { w: 8, h: 40 },
];

const STREAKS: Streak[] = [
  { left: "14%", top: "-10%", h: 90, w: 1, dur: 0.9, delay: 0, op: 0.5 },
  { left: "30%", top: "-30%", h: 70, w: 1, dur: 1.1, delay: 0.5, op: 0.4 },
  { left: "46%", top: "-6%", h: 100, w: 2, dur: 0.85, delay: 0.2, op: 0.5 },
  { left: "60%", top: "-24%", h: 80, w: 1, dur: 1.05, delay: 0.7, op: 0.35 },
  { left: "72%", top: "-14%", h: 88, w: 1, dur: 0.95, delay: 1.0, op: 0.45 },
  { left: "86%", top: "-28%", h: 72, w: 1, dur: 1.15, delay: 0.35, op: 0.4 },
  { left: "22%", top: "-20%", h: 84, w: 1, dur: 1.0, delay: 0.9, op: 0.4 },
];

export default function CityWindow({
  weather,
  lit = true,
}: {
  side: "left" | "right";
  weather: Weather;
  /** whether the room lamp is on; when off, the city reads brighter */
  lit?: boolean;
}) {
  const raining = weather === "rain";

  return (
    <div
      className="relative h-full w-full rounded-[3px] transition-[filter] duration-700"
      style={{
        // dark wood frame
        background: "linear-gradient(160deg, #2e2216, #17100a)",
        padding: 7,
        boxShadow:
          "0 20px 40px -20px rgba(0,0,0,0.9), inset 0 1px 0 rgba(214,180,113,0.25)",
        // with the lamp off the city is a subdued, moody night glow — not
        // brighter than a lit room (which would read as "lights on")
        filter: lit ? "brightness(1) saturate(1)" : "brightness(0.82) saturate(0.85)",
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2px]">
        {/* night sky */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #0a1020 0%, #101827 45%, #16202f 100%)",
          }}
        />

        {/* soft out-of-focus city lights (bokeh), behind the skyline */}
        {BOKEH.map((b, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: b.left,
              top: b.top,
              width: b.size,
              height: b.size,
              background: b.color,
              filter: `blur(${b.blur}px)`,
            }}
          />
        ))}

        {/* faint stars, strongest when the sky is clear */}
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: raining ? 0.15 : 0.5,
            backgroundImage:
              "radial-gradient(rgba(220,230,255,0.9) 0.5px, transparent 1px)",
            backgroundSize: "34px 40px",
            maskImage: "linear-gradient(180deg, #000, transparent 55%)",
            WebkitMaskImage: "linear-gradient(180deg, #000, transparent 55%)",
          }}
        />

        {/* skyline: dark buildings with tiny lit windows */}
        <div className="absolute inset-x-0 bottom-0 flex h-[62%] items-end gap-[2px] px-[2px]">
          {BUILDINGS.map((b, i) => (
            <div
              key={i}
              style={{
                width: `${b.w}%`,
                height: `${b.h}%`,
                background:
                  "linear-gradient(180deg, #0b0f18 0%, #060910 100%)",
                backgroundImage:
                  "radial-gradient(rgba(255,201,130,0.5) 0.5px, transparent 1.3px)",
                backgroundSize: "5px 7px",
                boxShadow: "inset 0 1px 0 rgba(120,150,200,0.08)",
              }}
            />
          ))}
        </div>

        {/* rain running down the glass */}
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: raining ? 1 : 0 }}
        >
          {STREAKS.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: s.left,
                top: s.top,
                width: s.w,
                height: s.h,
                opacity: s.op,
                background:
                  "linear-gradient(180deg, transparent, rgba(200,216,240,0.85) 45%, rgba(200,216,240,0.95) 55%, transparent)",
                transform: "rotate(8deg)",
                animation: `rain-streak ${s.dur}s linear ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>

        {/* glass sheen — a soft diagonal reflection on the pane */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(118deg, rgba(255,255,255,0.07), transparent 42%, transparent 82%, rgba(180,200,230,0.05))",
          }}
        />

        {/* mullions splitting the pane into quarters */}
        <span className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-[#1c140c]/90" />
        <span className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 bg-[#1c140c]/90" />
      </div>
    </div>
  );
}
