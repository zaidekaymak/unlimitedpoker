"use client";

import { useState } from "react";
import { nanoid } from "@/lib/nanoid";

interface Props {
  roomId: string;
  roomName: string;
  onJoined: (pid: string, name: string) => void;
}

export function JoinViaLinkForm({ roomId, roomName, onJoined }: Props) {
  const [playerName, setPlayerName] = useState(
    typeof window !== "undefined" ? localStorage.getItem("playerName") ?? "" : ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!playerName.trim()) return;

    const playerId = nanoid(12);
    localStorage.setItem("playerName", playerName.trim());
    sessionStorage.setItem(`player_${roomId}`, playerId);
    sessionStorage.setItem(`playerName_${roomId}`, playerName.trim());
    onJoined(playerId, playerName.trim());
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-1">{roomName}</h2>
        <p className="text-sm text-gray-500 mb-6">Odaya katılmak için adını gir</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adın</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="İsim yazın"
              autoFocus
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 bg-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Odaya Katıl
          </button>
        </form>
      </div>
    </div>
  );
}
