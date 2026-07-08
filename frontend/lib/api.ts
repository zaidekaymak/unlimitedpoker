const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface CreateRoomResponse {
  roomId: string;
  adminId: string;
  adminPlayerId: string;
}

export async function createRoom(name: string, adminName: string): Promise<CreateRoomResponse> {
  const res = await fetch(`${API_URL}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, adminName }),
  });
  if (!res.ok) throw new Error("Failed to create room");
  return res.json();
}

export async function getRoom(roomId: string) {
  const res = await fetch(`${API_URL}/rooms/${roomId}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export function getWSUrl(roomId: string): string {
  const wsBase =
    process.env.NEXT_PUBLIC_WS_URL ??
    (typeof window !== "undefined" && window.location.protocol === "https:"
      ? "wss://localhost:8080"
      : "ws://localhost:8080");
  return `${wsBase}/ws/${roomId}`;
}
