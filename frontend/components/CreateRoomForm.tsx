"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom } from "@/lib/api";

export function CreateRoomForm() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState(
    typeof window !== "undefined" ? localStorage.getItem("playerName") ?? "" : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roomName.trim() || !playerName.trim()) return;

    setLoading(true);
    setError("");
    try {
      const res = await createRoom(roomName.trim(), playerName.trim());
      localStorage.setItem("playerName", playerName.trim());
      localStorage.setItem(`player_${res.roomId}`, res.adminPlayerId);
      router.push(`/room/${res.roomId}?name=${encodeURIComponent(playerName.trim())}&pid=${res.adminPlayerId}`);
    } catch {
      setError("Oda oluşturulamadı. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Oda Adı</label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Sprint 42 Planning"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 bg-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Adın</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Zaide"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 bg-white"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Oluşturuluyor..." : "Oda Oluştur"}
      </button>
    </form>
  );
}
