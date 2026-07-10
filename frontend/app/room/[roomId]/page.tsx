import { getRoom } from "@/lib/api";
import { notFound } from "next/navigation";
import { RoomEntry } from "./RoomEntry";

interface Props {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ name?: string; pid?: string }>;
}

export default async function RoomPage({ params, searchParams }: Props) {
  const { roomId } = await params;
  const { name, pid } = await searchParams;

  const roomData = await getRoom(roomId);
  if (!roomData) notFound();

  return (
    <RoomEntry
      roomId={roomId}
      roomName={roomData.name}
      urlName={name}
      urlPid={pid}
    />
  );
}
