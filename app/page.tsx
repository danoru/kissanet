import RoomLayout from "@/components/ui/RoomLayout";
import ShelfView from "@/components/shelf/ShelfView";
import { getAlbums } from "@/lib/albums";

// Records change as they're added/played — always read fresh.
export const dynamic = "force-dynamic";

export default async function Home() {
  const albums = await getAlbums();

  return (
    <RoomLayout active="room">
      {albums.length > 0 ? (
        <ShelfView albums={albums} />
      ) : (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="font-display text-3xl italic text-muted">
            The shelf is empty.
          </p>
          <p className="max-w-sm font-mono text-[11px] uppercase tracking-[0.2em] text-muted/70">
            Add a record and it will be waiting here, spine-out, next time the
            lights go down.
          </p>
        </div>
      )}
    </RoomLayout>
  );
}
