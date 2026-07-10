import { getRoom } from "@/lib/api";
import { notFound } from "next/navigation";
import { RoomClient } from "./RoomClient";
import { JoinViaLinkForm } from "./JoinViaLinkForm";

interface Props {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ name?: string; pid?: string }>;
}

export default async function RoomPage({ params, searchParams }: Props) {
  const { roomId } = await params;
  const { name, pid } = await searchParams;

  const roomData = await getRoom(roomId);
  if (!roomData) notFound();

  if (!name || !pid) {
    return <JoinViaLinkForm roomId={roomId} roomName={roomData.name} />;
  }

  return (
    <RoomClient
      roomId={roomId}
      roomName={roomData.name}
      playerId={pid}
      playerName={name}
    />
  );
}
