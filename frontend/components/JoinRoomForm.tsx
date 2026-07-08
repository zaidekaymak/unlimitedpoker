"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "@/lib/nanoid";

export function JoinRoomForm() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState(
    typeof window !== "undefined" ? localStorage.getItem("playerName") ?? "" : ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roomId.trim() || !playerName.trim()) return;

    const playerId = nanoid(12);
    localStorage.setItem("playerName", playerName.trim());
    localStorage.setItem(`player_${roomId.trim()}`, playerId);
    router.push(`/room/${roomId.trim()}?name=${encodeURIComponent(playerName.trim())}&pid=${playerId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Oda Kodu</label>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="v8k2mxpq"
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
      <button
        type="submit"
        className="w-full py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
      >
        Odaya Katıl
      </button>
    </form>
  );
}
