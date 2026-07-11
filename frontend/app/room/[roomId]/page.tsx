import { RoomEntry } from "./RoomEntry";

interface Props {
  params: Promise<{ roomId: string }>;
}

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params;
  return <RoomEntry roomId={roomId} />;
}
