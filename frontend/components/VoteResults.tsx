"use client";

import { Player } from "@/lib/types";

interface VoteResultsProps {
  votes: Record<string, string>;
  players: Record<string, Player>;
}

export function VoteResults({ votes, players }: VoteResultsProps) {
  const entries = Object.entries(votes);
  const numeric = entries
    .map(([, v]) => parseFloat(v))
    .filter((n) => !isNaN(n));

  const average =
    numeric.length > 0
      ? (numeric.reduce((a, b) => a + b, 0) / numeric.length).toFixed(1)
      : null;

  const allSame = numeric.length > 0 && numeric.every((n) => n === numeric[0]);

  // Distribution
  const counts: Record<string, number> = {};
  for (const [, v] of entries) {
    counts[v] = (counts[v] ?? 0) + 1;
  }
  const max = Math.max(...Object.values(counts));

  return (
    <div className="space-y-4">
      {allSame && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <span className="text-2xl">🎉</span>
          <p className="text-green-700 font-semibold mt-1">Konsensüs! Herkes aynı oyladı.</p>
        </div>
      )}

      {average && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
          <p className="text-sm text-indigo-500 font-medium">Ortalama</p>
          <p className="text-4xl font-bold text-indigo-700">{average}</p>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Dağılım</h3>
        {Object.entries(counts)
          .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
          .map(([value, count]) => (
            <div key={value} className="flex items-center gap-3">
              <span className="w-8 text-center font-bold text-gray-700">{value}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-4">
                <div
                  className="bg-indigo-400 h-4 rounded-full transition-all"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-500">{count}</span>
            </div>
          ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Oylar</h3>
        {entries.map(([playerId, value]) => (
          <div key={playerId} className="flex justify-between items-center p-2 rounded-lg bg-white border border-gray-100">
            <span className="text-sm text-gray-700">{players[playerId]?.name ?? playerId}</span>
            <span className="font-bold text-indigo-600">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
