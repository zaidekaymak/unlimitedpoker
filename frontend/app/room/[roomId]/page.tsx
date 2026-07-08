import { getRoom } from "@/lib/api";
import { notFound } from "next/navigation";
import { RoomClient } from "./RoomClient";

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
    // Redirect to home if missing player info
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Odaya katılmak için <a href="/" className="text-indigo-600 underline">ana sayfaya</a> gidin.
        </p>
      </div>
    );
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
