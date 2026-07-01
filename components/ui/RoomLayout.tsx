import Link from "next/link";
import GrainOverlay from "./GrainOverlay";
import RoomLight from "./RoomLight";
import RoomShell from "../ambient/RoomShell";
import Booth from "../ambient/Booth";
import AmbientControls from "../ambient/AmbientControls";

/**
 * The shared chrome for every screen: a dim room with a deep vignette,
 * a quiet masthead, and the ever-present film grain. Everything that
 * happens in Kissa happens inside this room.
 */
export default function RoomLayout({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: "room" | "add";
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-room text-cream">
      {/* the room given depth — angled side walls + floor + city windows,
          sitting behind the shelf */}
      <RoomShell />

      {/* a soft warm grade + a bloom of light around the sconce, to lift the
          coziness a touch without stealing the shelf's thunder */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[15] mix-blend-soft-light"
        style={{
          background:
            "radial-gradient(ellipse 50% 45% at 20% 22%, rgba(255,196,120,0.28), transparent 60%), linear-gradient(180deg, rgba(255,180,110,0.06), rgba(120,70,30,0.05))",
        }}
      />

      {/* the wall sconce that lights the room — and its switch */}
      <RoomLight />

      {/* the booth we're sitting in — table edge + leather backs, foreground */}
      <Booth />

      {/* edge vignette — the dark falls off toward the corners of the room */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 35%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <GrainOverlay />

      {/* sound + weather controls, grouped with the light switch in the corner */}
      <AmbientControls />

      <header className="relative z-30 flex items-baseline justify-between px-8 py-6 md:px-14">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-display text-3xl font-medium tracking-wide text-cream md:text-4xl">
            喫茶
          </span>
          <span className="font-display text-2xl italic text-amber transition-colors group-hover:text-cream md:text-3xl">
            kissa
          </span>
        </Link>

        <nav className="flex items-center gap-7 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link
            href="/"
            className={
              active === "room"
                ? "text-amber"
                : "transition-colors hover:text-cream"
            }
          >
            the room
          </Link>
          <Link
            href="/add"
            className={
              active === "add"
                ? "text-amber"
                : "transition-colors hover:text-cream"
            }
          >
            add a record
          </Link>
        </nav>
      </header>

      <main className="relative z-10">{children}</main>
    </div>
  );
}
