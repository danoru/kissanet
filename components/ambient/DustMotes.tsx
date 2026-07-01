/**
 * Slow dust motes drifting up through the lamp's light pool — the thing that
 * makes still air feel alive. Only rendered where the light catches them (wide
 * screens, left side), and fades out with the lamp when the light goes off.
 * Configs are hand-authored (no RNG) so server and client render identically.
 */

type Mote = {
  left: string;
  top: string;
  size: number;
  dur: number;
  delay: number;
  x: string;
  op: number;
};

const MOTES: Mote[] = [
  { left: "16%", top: "58%", size: 3, dur: 15, delay: 0, x: "16px", op: 0.5 },
  { left: "28%", top: "70%", size: 2, dur: 19, delay: 3, x: "-10px", op: 0.4 },
  { left: "40%", top: "50%", size: 4, dur: 22, delay: 7, x: "22px", op: 0.45 },
  { left: "22%", top: "44%", size: 2, dur: 17, delay: 1, x: "8px", op: 0.35 },
  { left: "52%", top: "64%", size: 3, dur: 24, delay: 5, x: "-16px", op: 0.4 },
  { left: "34%", top: "38%", size: 2, dur: 20, delay: 9, x: "12px", op: 0.3 },
  { left: "46%", top: "74%", size: 3, dur: 18, delay: 2, x: "-6px", op: 0.5 },
  { left: "12%", top: "48%", size: 2, dur: 21, delay: 11, x: "18px", op: 0.35 },
  { left: "58%", top: "52%", size: 2, dur: 16, delay: 6, x: "-12px", op: 0.4 },
  { left: "30%", top: "60%", size: 4, dur: 26, delay: 13, x: "20px", op: 0.45 },
  { left: "44%", top: "42%", size: 2, dur: 23, delay: 4, x: "-8px", op: 0.3 },
  { left: "20%", top: "66%", size: 3, dur: 19, delay: 8, x: "10px", op: 0.45 },
];

export default function DustMotes({ on }: { on: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-[70px] z-[23] hidden h-[600px] w-[560px] transition-opacity duration-700 lg:block"
      style={{ opacity: on ? 1 : 0 }}
    >
      {MOTES.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: m.left,
            top: m.top,
            width: m.size,
            height: m.size,
            background:
              "radial-gradient(circle, rgba(240,206,140,0.9), rgba(200,131,42,0.2) 60%, transparent 70%)",
            filter: "blur(0.5px)",
            animation: `mote-rise ${m.dur}s linear ${m.delay}s infinite`,
            ["--mote-x" as string]: m.x,
            ["--mote-opacity" as string]: String(m.op),
          }}
        />
      ))}
    </div>
  );
}
