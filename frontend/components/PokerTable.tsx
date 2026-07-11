"use client";

import { useState } from "react";
import { Player, EmojiEvent } from "@/lib/types";

const EMOJIS = ["🎉", "😂", "👏", "🤔", "🙈", "🔥", "💯", "👍"];

interface PokerTableProps {
  players: Record<string, Player>;
  votes: Record<string, string> | null;
  revealed: boolean;
  myPlayerId: string;
  emojiEvents: EmojiEvent[];
  onSendEmoji: (targetId: string, emoji: string) => void;
}

export function PokerTable({
  players,
  votes,
  revealed,
  myPlayerId,
  emojiEvents,
  onSendEmoji,
}: PokerTableProps) {
  const [activePickerId, setActivePickerId] = useState<string | null>(null);
  const playerList = Object.values(players);

  function togglePicker(playerId: string) {
    if (playerId === myPlayerId) return;
    setActivePickerId((prev) => (prev === playerId ? null : playerId));
  }

  function handleEmojiClick(targetId: string, emoji: string) {
    onSendEmoji(targetId, emoji);
    setActivePickerId(null);
  }

  return (
    <div
      className="relative w-full mx-auto select-none"
      style={{ maxWidth: 720, aspectRatio: "12/7" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setActivePickerId(null);
      }}
    >
      {/* Felt table surface */}
      <div
        className="absolute shadow-2xl"
        style={{
          left: "12%",
          top: "12%",
          width: "76%",
          height: "76%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 40% 35%, #1a6b3a 0%, #155230 60%, #0f3d24 100%)",
          border: "14px solid #6b3a1a",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.45), inset 0 2px 8px rgba(255,255,255,0.08)",
        }}
      >
        {/* Subtle felt grain */}
        <div
          className="absolute inset-0 rounded-full opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 4px)",
          }}
        />
        {/* Inner rail highlight */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 6,
            border: "2px solid rgba(255,255,255,0.06)",
          }}
        />
      </div>

      {/* Players around the table */}
      {playerList.map((player, i) => {
        const total = playerList.length;
        const angle = (2 * Math.PI * i) / total - Math.PI / 2;
        // Ellipse slightly outside the table
        const rx = 44; // % of container width from center
        const ry = 40; // % of container height from center
        const x = 50 + rx * Math.cos(angle);
        const y = 50 + ry * Math.sin(angle);

        const isMe = player.id === myPlayerId;
        const showPicker = activePickerId === player.id;
        const myParticles = emojiEvents.filter((e) => e.targetPlayerId === player.id);

        return (
          <div
            key={player.id}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: showPicker ? 30 : 10,
            }}
          >
            {/* Floating emoji particles */}
            {myParticles.map((particle) => (
              <span
                key={particle.id}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "-8px",
                  fontSize: "1.8rem",
                  pointerEvents: "none",
                  zIndex: 60,
                  animation: "emoji-float-up 1.5s ease-out forwards",
                }}
              >
                {particle.emoji}
              </span>
            ))}

            {/* Emoji picker */}
            {showPicker && (
              <div
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex gap-1 rounded-full shadow-xl px-3 py-1.5 z-40 border border-gray-200 dark:border-gray-600 whitespace-nowrap bg-white dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-1">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      className="text-xl hover:scale-125 transition-transform leading-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmojiClick(player.id, emoji);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Player card */}
            <div
              className={`
                relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl shadow-md cursor-pointer
                transition-all duration-150 hover:scale-105 active:scale-95
                ${
                  isMe
                    ? "bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-400 dark:border-indigo-500"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500"
                }
              `}
              style={{ minWidth: 72 }}
              onClick={() => togglePicker(player.id)}
              title={isMe ? player.name : `${player.name} — emoji fırlat`}
            >
              {player.isAdmin && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm leading-none">
                  👑
                </span>
              )}

              <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 text-center max-w-[68px] truncate leading-tight">
                {player.name}
              </span>

              <div className="w-8 h-7 rounded flex items-center justify-center text-xs font-bold">
                {revealed && votes?.[player.id] ? (
                  <span className="bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 w-full h-full rounded flex items-center justify-center font-bold">
                    {votes[player.id]}
                  </span>
                ) : player.hasVoted ? (
                  <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 w-full h-full rounded flex items-center justify-center">
                    ✓
                  </span>
                ) : (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-400 w-full h-full rounded flex items-center justify-center">
                    —
                  </span>
                )}
              </div>

              {!isMe && (
                <span className="text-[9px] text-gray-400 dark:text-gray-500 leading-none">
                  🎯 fırlat
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {playerList.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-green-200/40 text-sm font-medium">
          Katılımcı bekleniyor...
        </div>
      )}
    </div>
  );
}
