import { getRoom } from "@/lib/api";
import { notFound } from "next/navigation";
import { RoomEntry } from "./RoomEntry";

interface Props {
  params: Promise<{ roomId: string }>;
}

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params;

  const roomData = await getRoom(roomId);
  if (!roomData) notFound();

  return <RoomEntry roomId={roomId} roomName={roomData.name} />;
}
