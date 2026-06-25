import RoomLayout from "@/components/ui/RoomLayout";
import AddRecord from "@/components/add/AddRecord";

export default function AddPage() {
  return (
    <RoomLayout active="add">
      <AddRecord />
    </RoomLayout>
  );
}
