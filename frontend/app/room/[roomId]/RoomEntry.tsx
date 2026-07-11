"use client";

import { useEffect, useState } from "react";
import { RoomClient } from "./RoomClient";
import { JoinViaLinkForm } from "./JoinViaLinkForm";

interface Props {
  roomId: string;
  roomName: string;
}

export function RoomEntry({ roomId, roomName }: Props) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<{ pid: string; name: string } | null>(null);

  useEffect(() => {
    const pid = sessionStorage.getItem(`player_${roomId}`);
    const name = sessionStorage.getItem(`playerName_${roomId}`);
    if (pid && name) setSession({ pid, name });
    setReady(true);
  }, [roomId]);

  function handleJoined(pid: string, name: string) {
    setSession({ pid, name });
  }

  if (!ready) return null;

  if (session) {
    return <RoomClient roomId={roomId} roomName={roomName} playerId={session.pid} playerName={session.name} />;
  }

  return <JoinViaLinkForm roomId={roomId} roomName={roomName} onJoined={handleJoined} />;
}
