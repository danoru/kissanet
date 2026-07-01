/**
 * The closed lower cabinet beneath the shelves — two wooden doors with brass
 * knobs, grounding the built-in like real café cabinetry. Decorative.
 */
function Knob() {
  return (
    <span
      aria-hidden
      className="h-3 w-3 rounded-full"
      style={{
        background: "radial-gradient(circle at 35% 30%, #e3c489, #7a5a24 70%, #3a2a12)",
        boxShadow: "0 2px 4px -1px rgba(0,0,0,0.8)",
      }}
    />
  );
}

function Door() {
  return (
    <div
      className="wood-grain relative flex-1 rounded-[3px]"
      style={{
        backgroundColor: "rgb(var(--color-wood))",
        boxShadow:
          "inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 2px 6px -2px rgba(255,255,255,0.10), inset 0 -8px 18px -8px rgba(0,0,0,0.6)",
      }}
    >
      {/* recessed inset panel */}
      <div
        className="absolute inset-2 rounded-[2px]"
        style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.4), inset 0 3px 8px -3px rgba(0,0,0,0.55)" }}
      />
      {/* knob near the top-inner corner */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <Knob />
      </div>
    </div>
  );
}

export default function CabinetBase() {
  return (
    <div aria-hidden className="flex h-28 gap-2 px-2 pb-2 pt-1">
      <Door />
      <Door />
    </div>
  );
}
