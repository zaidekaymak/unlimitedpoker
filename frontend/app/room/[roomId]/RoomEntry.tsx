"use client";

import { useEffect, useState } from "react";
import { RoomClient } from "./RoomClient";
import { JoinViaLinkForm } from "./JoinViaLinkForm";

interface Props {
  roomId: string;
  roomName: string;
  urlName?: string;
  urlPid?: string;
}

export function RoomEntry({ roomId, roomName, urlName, urlPid }: Props) {
  const [ready, setReady] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const storedPid = localStorage.getItem(`player_${roomId}`);
    setIsOwner(!!urlPid && storedPid === urlPid);
    setReady(true);
  }, [roomId, urlPid]);

  if (!ready) return null;

  if (isOwner && urlName && urlPid) {
    return <RoomClient roomId={roomId} roomName={roomName} playerId={urlPid} playerName={urlName} />;
  }

  return <JoinViaLinkForm roomId={roomId} roomName={roomName} />;
}
