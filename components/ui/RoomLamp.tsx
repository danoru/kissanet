/**
 * A brass wall sconce on the left wall, its pleated shade pooling warm
 * tungsten light down over the shelf — the room's actual light source.
 * Purely atmospheric: it sits behind everything and ignores the pointer.
 */
export default function RoomLamp() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-[14%] z-0 hidden select-none md:block"
      style={{ width: 360, height: 520 }}
    >
      {/* the broad pool of light the lamp throws across the room */}
      <div
        className="absolute -left-24 -top-24 h-[640px] w-[680px]"
        style={{
          background:
            "radial-gradient(ellipse 45% 42% at 32% 30%, rgba(220,150,60,0.22), rgba(200,131,42,0.08) 45%, transparent 70%)",
        }}
      />

      {/* mounting plate against the wall */}
      <span
        className="absolute left-0 top-[44px] h-16 w-3 rounded-r-sm"
        style={{
          background: "linear-gradient(180deg, #6e5836, #2c2113)",
          boxShadow: "0 6px 14px -6px rgba(0,0,0,0.8)",
        }}
      />

      {/* brass gooseneck arm reaching out from the wall */}
      <svg
        className="absolute left-2 top-[40px]"
        width="150"
        height="120"
        viewBox="0 0 150 120"
        fill="none"
      >
        <path
          d="M2 34 C 60 34, 96 18, 116 70"
          stroke="url(#brass)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="brass" x1="0" y1="0" x2="150" y2="120">
            <stop offset="0" stopColor="#d8b471" />
            <stop offset="0.5" stopColor="#9c7636" />
            <stop offset="1" stopColor="#5c421f" />
          </linearGradient>
        </defs>
      </svg>

      {/* the pleated shade */}
      <div className="absolute left-[96px] top-[96px]">
        {/* bulb glow spilling from under the rim */}
        <span
          className="absolute left-1/2 top-[46px] h-24 w-24 -translate-x-1/2 rounded-full animate-glow"
          style={{
            background:
              "radial-gradient(circle, rgba(255,214,140,0.9), rgba(220,150,60,0.35) 45%, transparent 70%)",
            filter: "blur(2px)",
          }}
        />
        {/* shade body — a downward-opening pleated cone */}
        <div
          className="relative h-[58px] w-[112px]"
          style={{
            clipPath: "polygon(26% 0, 74% 0, 100% 100%, 0 100%)",
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(0,0,0,0.16) 0 1px, transparent 1px 9px), linear-gradient(180deg, #e6c188 0%, #c8923f 55%, #fbe3ad 100%)",
            boxShadow:
              "inset 0 -6px 10px -4px rgba(255,230,170,0.9), 0 10px 24px -10px rgba(0,0,0,0.7)",
          }}
        />
        {/* finial on top of the shade */}
        <span className="absolute -top-[5px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#caa45e]" />
      </div>
    </div>
  );
}
