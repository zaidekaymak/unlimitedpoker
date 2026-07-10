"use client";

import { useState } from "react";
import { usePokerRoom } from "@/hooks/usePokerRoom";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { PlayerList } from "@/components/PlayerList";
import { CardDeck } from "@/components/CardDeck";
import { VoteResults } from "@/components/VoteResults";
import { AdminControls } from "@/components/AdminControls";
import { CopyLinkButton } from "@/components/CopyLinkButton";

interface Props {
  roomId: string;
  roomName: string;
  playerId: string;
  playerName: string;
}

export function RoomClient({ roomId, roomName, playerId, playerName }: Props) {
  const { room, status, sendVote, sendReveal, sendReset } = usePokerRoom(
    roomId,
    playerId,
    playerName
  );

  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const myPlayer = room?.players[playerId];
  const isAdmin = myPlayer?.isAdmin ?? false;

  function handleVote(value: string) {
    setSelectedValue(value);
    sendVote(value);
  }

  function handleReset() {
    setSelectedValue(null);
    sendReset();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{roomName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <CopyLinkButton roomId={roomId} />
          <ConnectionBadge status={status} />
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-[280px_1fr] gap-6">
        {/* Player list */}
        <aside>
          {room ? (
            <PlayerList
              players={room.players}
              votes={room.votes}
              revealed={room.revealed}
            />
          ) : (
            <div className="text-gray-400 text-sm">Bağlanılıyor...</div>
          )}
        </aside>

        {/* Main area */}
        <main className="space-y-6">
          {room?.revealed && room.votes && Object.keys(room.votes).length > 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <VoteResults votes={room.votes} players={room.players} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <h2 className="text-center text-gray-500 text-sm mb-4">
                {myPlayer?.hasVoted
                  ? "Oyunuz alındı. Diğerleri oylasın..."
                  : "Kartınızı seçin"}
              </h2>
              <CardDeck
                selectedValue={selectedValue}
                hasVoted={myPlayer?.hasVoted ?? false}
                revealed={room?.revealed ?? false}
                onVote={handleVote}
              />
            </div>
          )}

          {isAdmin && room && (
            <AdminControls
              revealed={room.revealed}
              onReveal={sendReveal}
              onReset={handleReset}
            />
          )}
        </main>
      </div>
    </div>
  );
}
