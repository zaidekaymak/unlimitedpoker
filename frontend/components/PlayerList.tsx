"use client";

import { Player } from "@/lib/types";

interface PlayerListProps {
  players: Record<string, Player>;
  votes: Record<string, string> | null;
  revealed: boolean;
}

export function PlayerList({ players, votes, revealed }: PlayerListProps) {
  const playerList = Object.values(players);

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Katılımcılar ({playerList.length})
      </h2>
      {playerList.map((player) => (
        <div
          key={player.id}
          className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-2">
            {player.isAdmin && <span title="Admin">👑</span>}
            <span className={`text-sm ${player.isAdmin ? "font-semibold" : "font-medium"}`}>
              {player.name}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold">
            {revealed && votes?.[player.id] ? (
              <span className="bg-indigo-100 text-indigo-700 w-full h-full rounded-lg flex items-center justify-center">
                {votes[player.id]}
              </span>
            ) : player.hasVoted ? (
              <span className="bg-green-100 text-green-600 w-full h-full rounded-lg flex items-center justify-center">
                ✓
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-400 w-full h-full rounded-lg flex items-center justify-center">
                —
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
