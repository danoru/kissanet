/**
 * A little tube amplifier on the hi-fi counter — the McIntosh-style heart of
 * the kissa's sound. Warm glass bottles glowing on top of a black chassis
 * with a brass lip, and a pair of blue-lit VU meters whose needles wander
 * while a record plays. Always warmed up: the tubes glow even at idle.
 */

const TUBES = [
  { h: 26, delay: 0 },
  { h: 32, delay: 1.6 },
  { h: 32, delay: 0.7 },
  { h: 26, delay: 2.4 },
];

function Needle({
  playing,
  left,
  dur,
}: {
  playing: boolean;
  left: string;
  dur: number;
}) {
  return (
    <span
      className="absolute bottom-[3px] h-[80%] w-px origin-bottom rounded-full"
      style={{
        left,
        background: "linear-gradient(180deg, #dce9ff, rgba(160,190,240,0.4))",
        animation: playing ? `vu-needle ${dur}s ease-in-out infinite alternate` : undefined,
        transform: playing ? undefined : "rotate(-28deg)",
      }}
    />
  );
}

export default function TubeAmp({ playing }: { playing: boolean }) {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[210px]">
      {/* warm halo above the glass */}
      <div
        className="pointer-events-none absolute -top-6 inset-x-0 h-14"
        style={{
          background:
            "radial-gradient(ellipse 60% 90% at 50% 100%, rgba(255,150,60,0.16), transparent 72%)",
          filter: "blur(4px)",
        }}
      />

      {/* the tubes, standing along the top of the chassis */}
      <div className="relative mx-4 flex items-end justify-around">
        {TUBES.map((t, i) => (
          <span
            key={i}
            className="relative block w-[13px] rounded-t-full"
            style={{
              height: t.h,
              background:
                "linear-gradient(180deg, rgba(96,74,52,0.45), rgba(28,20,14,0.85))",
              boxShadow:
                "inset 0 0 4px rgba(255,170,80,0.5), inset 0 -7px 7px -4px rgba(255,140,50,0.75), inset 1px 0 0 rgba(255,255,255,0.14)",
            }}
          >
            {/* the filament */}
            <span
              className="absolute bottom-[3px] left-1/2 h-[45%] w-[5px] -translate-x-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, #ffca7d, rgba(255,150,50,0.45) 70%, transparent)",
                filter: "blur(1px)",
                animation: `tube-glow ${4 + (i % 3)}s ease-in-out ${t.delay}s infinite`,
              }}
            />
          </span>
        ))}
      </div>

      {/* the chassis */}
      <div
        className="relative rounded-[4px] px-2.5 pb-2 pt-2 ring-1 ring-black/70"
        style={{
          background: "linear-gradient(180deg, #211d18 0%, #121009 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(216,180,113,0.4), inset 0 -3px 8px -3px rgba(0,0,0,0.7), 0 16px 30px -16px rgba(0,0,0,0.9)",
        }}
      >
        {/* the blue meter window */}
        <div
          className="relative flex h-8 overflow-hidden rounded-[2px] ring-1 ring-black/70 transition-shadow duration-500"
          style={{
            background: "linear-gradient(180deg, #0c1f36 0%, #06111f 100%)",
            boxShadow: playing
              ? "inset 0 0 18px rgba(90,150,255,0.5), inset 0 1px 0 rgba(160,200,255,0.25)"
              : "inset 0 0 10px rgba(90,150,255,0.22), inset 0 1px 0 rgba(160,200,255,0.12)",
          }}
        >
          {[0, 1].map((i) => (
            <span key={i} className="relative block h-full flex-1">
              {/* tick arc */}
              <span
                className="absolute inset-x-2 top-1 flex items-start justify-between"
                aria-hidden
              >
                {Array.from({ length: 7 }).map((_, j) => (
                  <span
                    key={j}
                    className="w-px bg-[#9fc2ff]/40"
                    style={{ height: j === 0 || j === 6 ? 5 : 3 }}
                  />
                ))}
              </span>
              <Needle
                playing={playing}
                left="50%"
                dur={1.1 + i * 0.35}
              />
            </span>
          ))}
          {/* centre divider */}
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/60" />
        </div>

        {/* brand plate + knobs */}
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-mono text-[7px] uppercase tracking-[0.28em] text-cream/35">
            tube
          </span>
          <span className="flex items-center gap-1.5">
            {[0, 1].map((i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, #e3c489, #7a5a24 70%, #3a2a12)",
                  boxShadow: "0 1px 3px -1px rgba(0,0,0,0.8)",
                }}
              />
            ))}
            <span
              className="ml-1 h-1.5 w-1.5 rounded-full"
              style={{
                background: "#ff9a58",
                boxShadow: "0 0 5px rgba(255,140,60,0.8)",
              }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
