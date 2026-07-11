"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "@/lib/nanoid";

export function CreateRoomForm() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState(
    typeof window !== "undefined" ? localStorage.getItem("playerName") ?? "" : ""
  );
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roomName.trim() || !playerName.trim()) return;

    const roomId = nanoid(8);
    const playerId = nanoid(12);

    localStorage.setItem("playerName", playerName.trim());
    sessionStorage.setItem(`player_${roomId}`, playerId);
    sessionStorage.setItem(`playerName_${roomId}`, playerName.trim());
    sessionStorage.setItem(`roomName_${roomId}`, roomName.trim());

    router.push(`/room/${roomId}`);
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
          placeholder="İsim yazın"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 bg-white"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
      >
        Oda Oluştur
      </button>
    </form>
  );
}
