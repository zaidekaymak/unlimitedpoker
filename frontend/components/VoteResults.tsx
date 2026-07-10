"use client";

import { useEffect, useState } from "react";
import { Player } from "@/lib/types";

interface VoteResultsProps {
  votes: Record<string, string>;
  players: Record<string, Player>;
}

const EMOJIS = ["🎉", "🎊", "🥳", "⭐", "✨", "🎈", "🙌", "💥"];

function Confetti() {
  const [items] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      left: `${Math.random() * 90 + 5}%`,
      delay: `${Math.random() * 0.6}s`,
      size: `${Math.random() * 1.2 + 1.2}rem`,
    }))
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {items.map((item) => (
        <span
          key={item.id}
          className="absolute bottom-0 animate-float-up"
          style={{
            left: item.left,
            animationDelay: item.delay,
            fontSize: item.size,
          }}
        >
          {item.emoji}
        </span>
      ))}
      <style>{`
        @keyframes float-up {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up 2.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export function VoteResults({ votes, players }: VoteResultsProps) {
  const entries = Object.entries(votes);
  const numeric = entries.map(([, v]) => parseFloat(v)).filter((n) => !isNaN(n));
  const average =
    numeric.length > 0
      ? (numeric.reduce((a, b) => a + b, 0) / numeric.length).toFixed(1)
      : null;
  const allSame = numeric.length > 1 && numeric.every((n) => n === numeric[0]);

  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (allSame) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(t);
    }
  }, [allSame]);

  // Distribution: sort by count descending
  const counts: Record<string, number> = {};
  for (const [, v] of entries) counts[v] = (counts[v] ?? 0) + 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const maxCount = sorted[0]?.[1] ?? 1;

  return (
    <>
      {showConfetti && <Confetti />}

      <div className="space-y-4">
        {allSame && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-700 font-semibold text-lg">Konsensüs! Herkes aynı oyladı 🎉</p>
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
          {sorted.map(([value, count]) => (
            <div key={value} className="flex items-center gap-3">
              <span className="w-16 text-sm text-gray-500 shrink-0">
                <span className="font-bold text-gray-800">{count}</span> kişi
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-5">
                <div
                  className="bg-indigo-400 h-5 rounded-full transition-all flex items-center justify-end pr-2"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-8 text-center font-bold text-gray-700 shrink-0">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
