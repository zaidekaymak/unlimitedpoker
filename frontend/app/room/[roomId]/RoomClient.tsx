"use client";

import { useState } from "react";
import { usePokerRoom } from "@/hooks/usePokerRoom";
import { AdminControls } from "@/components/AdminControls";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { PokerTable } from "@/components/PokerTable";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  roomId: string;
  roomName: string;
  playerId: string;
  playerName: string;
}

export function RoomClient({ roomId, roomName, playerId, playerName }: Props) {
  const { room, sendVote, sendReveal, sendReset, sendEmoji, emojiEvents } = usePokerRoom(
    roomId,
    playerId,
    playerName
  );
  const { dark, toggle } = useTheme();

  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const myPlayer = room?.players[playerId];

  function handleVote(value: string) {
    setSelectedValue(value);
    sendVote(value);
  }

  function handleReset() {
    setSelectedValue(null);
    sendReset();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {room?.name || roomName}
          </h1>
          <div className="flex items-center gap-3">
            <CopyLinkButton roomId={roomId} />
            <button
              onClick={toggle}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-lg"
              title={dark ? "Açık mod" : "Koyu mod"}
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Poker table — kart seçimi masanın içinde */}
        {room ? (
          <PokerTable
            players={room.players}
            votes={room.votes}
            revealed={room.revealed}
            myPlayerId={playerId}
            emojiEvents={emojiEvents}
            onSendEmoji={sendEmoji}
            selectedValue={selectedValue}
            hasVoted={myPlayer?.hasVoted ?? false}
            onVote={handleVote}
          />
        ) : (
          <div className="text-gray-400 text-sm text-center py-16">Bağlanılıyor...</div>
        )}

        {room && (
          <AdminControls
            revealed={room.revealed}
            onReveal={sendReveal}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
