/**
 * The built-in record cabinet: a wooden frame (cornice + side pilasters) around
 * a dark recessed interior lit warmly from the top-left, where the bays live.
 * The bays themselves (records, hi-fi, base) are passed as children by ShelfView.
 */

function Pilaster({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className="wood-grain w-4 shrink-0 md:w-6"
      style={{
        backgroundColor: "rgb(var(--color-wood))",
        boxShadow:
          side === "left"
            ? "inset -4px 0 10px -5px rgba(0,0,0,0.85), inset 3px 0 0 rgb(var(--color-wood-hi) / 0.4)"
            : "inset 4px 0 10px -5px rgba(0,0,0,0.85), inset -3px 0 0 rgb(var(--color-wood-hi) / 0.4)",
      }}
    />
  );
}

export default function Cabinet({ children }: { children: React.ReactNode }) {
  return (
    // sized to stand WITHIN the room's back wall (64vw wide, see lib/room.ts),
    // leaving space at each side for the horn speakers
    <div className="relative mx-auto w-full lg:w-[52vw] lg:max-w-[980px]">
      {/* cornice across the top */}
      <div
        className="wood-grain-h h-5 rounded-t-lg md:h-6"
        style={{
          backgroundColor: "rgb(var(--color-wood))",
          boxShadow:
            "inset 0 2px 0 rgb(var(--color-wood-hi) / 0.5), inset 0 -6px 12px -6px rgba(0,0,0,0.7), 0 10px 22px -12px rgba(0,0,0,0.9)",
        }}
      />
      {/* a thin brass inlay under the cornice */}
      <div
        aria-hidden
        className="h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, rgba(216,180,113,0) 0%, rgba(216,180,113,0.45) 18%, rgba(216,180,113,0.45) 82%, rgba(216,180,113,0) 100%)",
        }}
      />

      {/* the cabinet body */}
      <div
        className="wood-grain relative flex overflow-hidden rounded-b-md border-x border-b border-black/50"
        style={{
          backgroundColor: "rgb(var(--color-wood))",
          boxShadow: "0 40px 80px -40px rgba(0,0,0,0.95)",
        }}
      >
        <Pilaster side="left" />

        {/* recessed interior */}
        <div
          className="relative flex-1"
          style={{
            background: "linear-gradient(180deg, #1a130d 0%, #0f0b08 100%)",
            boxShadow: "inset 0 0 90px -18px rgba(0,0,0,0.95)",
          }}
        >
          {/* warm light pooled inside the case, top-left (matches the lamp) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 42% at 24% 18%, rgba(200,131,42,0.16), transparent 70%)",
            }}
          />

          <div className="relative flex flex-col gap-1 p-2 md:gap-2 md:p-3">
            {children}
          </div>
        </div>

        <Pilaster side="right" />
      </div>
    </div>
  );
}
