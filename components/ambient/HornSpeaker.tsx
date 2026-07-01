/**
 * A vintage horn loudspeaker, Altec/JBL style — the jazz-kissa icon. A tall
 * dark-walnut cabinet with a flared horn tweeter up top and a big exposed
 * woofer below, standing on the floor beside the record wall. Decorative;
 * drawn entirely with gradients. The parent positions and sizes it.
 */
export default function HornSpeaker({ side }: { side: "left" | "right" }) {
  const inner = side === "left" ? "-14px" : "14px";
  return (
    <div aria-hidden className="relative h-full w-full">
      {/* floor contact shadow */}
      <div
        className="absolute -bottom-2 left-1/2 h-5 w-[115%] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(0,0,0,0.65), transparent 70%)",
          filter: "blur(5px)",
        }}
      />

      {/* the cabinet box */}
      <div
        className="wood-grain absolute inset-0 rounded-t-[5px] rounded-b-[3px]"
        style={{
          backgroundColor: "#2e1f13",
          border: "1px solid rgba(0,0,0,0.6)",
          boxShadow: `inset 0 2px 0 rgba(150,110,70,0.35), inset ${inner} 0 26px -14px rgba(0,0,0,0.85), 0 30px 50px -25px rgba(0,0,0,0.95)`,
        }}
      >
        {/* recessed front baffle */}
        <div
          className="absolute inset-x-[7%] bottom-[4%] top-[5%] rounded-[3px]"
          style={{
            background: "linear-gradient(180deg, #181009 0%, #0f0a06 100%)",
            boxShadow:
              "inset 0 0 0 1px rgba(0,0,0,0.6), inset 0 4px 10px -4px rgba(0,0,0,0.85)",
          }}
        >
          {/* the horn — a wide flare with vertical fins, dark at the throat */}
          <div
            className="absolute left-[8%] right-[8%] top-[6%] h-[23%] rounded-[3px]"
            style={{
              background:
                "radial-gradient(ellipse 55% 85% at 50% 50%, #040302 18%, #2a2014 68%, #443320 100%)",
              boxShadow:
                "inset 0 0 0 2px rgba(90,68,40,0.9), inset 0 0 16px rgba(0,0,0,0.9)",
            }}
          >
            <div
              className="absolute inset-[9%]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(190,155,105,0.5) 0 1px, transparent 1px 11%)",
                maskImage:
                  "radial-gradient(ellipse 72% 100% at 50% 50%, black 30%, transparent 88%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 72% 100% at 50% 50%, black 30%, transparent 88%)",
              }}
            />
          </div>

          {/* the woofer — surround ring, ribbed paper cone, dust cap */}
          <div
            className="absolute left-1/2 top-[36%] aspect-square w-[76%] -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 42% 36%, #2c241a 0%, #17110b 55%, #060403 100%)",
              boxShadow:
                "inset 0 0 0 3px rgba(70,52,32,0.7), inset 0 6px 14px rgba(0,0,0,0.8), 0 8px 16px -6px rgba(0,0,0,0.8)",
            }}
          >
            <div
              className="absolute inset-[10%] rounded-full"
              style={{
                background:
                  "repeating-radial-gradient(circle, rgba(0,0,0,0.35) 0 3px, transparent 3px 9px), radial-gradient(circle at 40% 34%, #221a11, #0b0805 72%)",
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 38% 32%, #493a26, #150f08 78%)",
                boxShadow: "0 3px 6px -2px rgba(0,0,0,0.8)",
              }}
            />
          </div>

          {/* bass port + a small brass badge at the foot */}
          <div className="absolute inset-x-0 bottom-[3.5%] flex flex-col items-center gap-[6px]">
            <span
              className="block h-[7px] w-[38%] rounded-full bg-black/85"
              style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.9), 0 1px 0 rgba(120,90,55,0.25)" }}
            />
            <span
              className="block h-[3px] w-[14%] rounded-[1px]"
              style={{
                background: "linear-gradient(90deg, #8a6a34, #d8b471, #8a6a34)",
                opacity: 0.7,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
