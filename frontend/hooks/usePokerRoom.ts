"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Player, Room, EmojiEvent } from "@/lib/types";

interface UsePokerRoomReturn {
  room: Room | null;
  sendVote: (value: string) => void;
  sendReveal: () => void;
  sendReset: () => void;
  sendEmoji: (targetId: string, emoji: string) => void;
  emojiEvents: EmojiEvent[];
}

export function usePokerRoom(
  roomId: string,
  playerId: string,
  playerName: string
): UsePokerRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [emojiEvents, setEmojiEvents] = useState<EmojiEvent[]>([]);
  const emojiCounter = useRef(0);
  const socketRef = useRef<Socket | null>(null);

  function spawnEmoji(targetId: string, emoji: string) {
    const id = ++emojiCounter.current;
    setEmojiEvents((prev) => [...prev, { id, emoji, targetPlayerId: targetId }]);
    setTimeout(() => {
      setEmojiEvents((prev) => prev.filter((e) => e.id !== id));
    }, 2000);
  }

  useEffect(() => {
    const roomName =
      (typeof window !== "undefined" && sessionStorage.getItem(`roomName_${roomId}`)) ||
      roomId;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ["polling", "websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-room", { roomId, playerId, playerName, roomName });
    });

    socket.on("room-state", (state: Room) => {
      setRoom(state);
    });

    socket.on("emoji", ({ targetId, emoji }: { targetId: string; emoji: string }) => {
      spawnEmoji(targetId, emoji);
    });

    // Tab tekrar görünür olunca rejoin
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && socket.connected) {
        socket.emit("join-room", { roomId, playerId, playerName, roomName });
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      socket.disconnect();
    };
  }, [roomId, playerId, playerName]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendVote = useCallback(
    (value: string) => {
      socketRef.current?.emit("vote", { roomId, playerId, value });
    },
    [roomId, playerId]
  );

  const sendReveal = useCallback(() => {
    socketRef.current?.emit("reveal", { roomId });
  }, [roomId]);

  const sendReset = useCallback(() => {
    socketRef.current?.emit("reset", { roomId });
  }, [roomId]);

  const sendEmoji = useCallback(
    (targetId: string, emoji: string) => {
      spawnEmoji(targetId, emoji);
      socketRef.current?.emit("emoji", { roomId, targetId, emoji });
    },
    [roomId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { room, sendVote, sendReveal, sendReset, sendEmoji, emojiEvents };
}
