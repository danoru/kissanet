import { notFound } from "next/navigation";
import RoomLayout from "@/components/ui/RoomLayout";
import EditRecord from "@/components/album/EditRecord";
import { getAlbum } from "@/lib/albums";

// Records change as they're edited — always read fresh.
export const dynamic = "force-dynamic";

export default async function EditAlbumPage({
  params,
}: {
  params: { id: string };
}) {
  const album = await getAlbum(params.id);
  if (!album) notFound();

  return (
    <RoomLayout>
      <EditRecord album={album} />
    </RoomLayout>
  );
}
