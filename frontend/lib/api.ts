import { supabase } from "./supabase";
import { nanoid } from "./nanoid";

export interface CreateRoomResponse {
  roomId: string;
  adminPlayerId: string;
}

export async function createRoom(name: string, adminName: string): Promise<CreateRoomResponse> {
  const roomId = nanoid(8);
  const playerId = nanoid(12);

  const { error: roomError } = await supabase
    .from("rooms")
    .insert({ id: roomId, name });
  if (roomError) throw new Error("Failed to create room");

  const { error: playerError } = await supabase
    .from("players")
    .insert({ id: playerId, room_id: roomId, name: adminName });
  if (playerError) throw new Error("Failed to create player");

  return { roomId, adminPlayerId: playerId };
}

export async function getRoom(roomId: string): Promise<{ id: string; name: string } | null> {
  const { data } = await supabase
    .from("rooms")
    .select("id, name")
    .eq("id", roomId)
    .single();
  return data;
}
