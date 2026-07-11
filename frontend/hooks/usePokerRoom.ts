"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { supabase } from "@/lib/supabase";
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
  const unmounted = useRef(false);

  async function loadState() {
    const { data: roomData } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();
    if (!roomData || unmounted.current) return;

    const { data: playersData } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId);

    let votes: Record<string, string> | null = null;
    if (roomData.revealed) {
      const { data: votesData } = await supabase
        .from("votes")
        .select("*")
        .eq("room_id", roomId);
      if (votesData) {
        votes = {};
        for (const v of votesData) votes[v.player_id] = v.value;
      }
    }

    const players: Record<string, Player> = {};
    for (const p of playersData ?? []) {
      players[p.id] = { id: p.id, name: p.name, isAdmin: false, hasVoted: p.has_voted };
    }

    if (!unmounted.current) {
      setRoom({ id: roomData.id, name: roomData.name, adminId: "", players, votes, revealed: roomData.revealed });
    }
  }

  function spawnEmoji(targetId: string, emoji: string) {
    const id = ++emojiCounter.current;
    setEmojiEvents((prev) => [...prev, { id, emoji, targetPlayerId: targetId }]);
    setTimeout(() => {
      setEmojiEvents((prev) => prev.filter((e) => e.id !== id));
    }, 2000);
  }

  useEffect(() => {
    unmounted.current = false;

    function deletePlayerFromDB() {
      fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/players?id=eq.${playerId}`,
        {
          method: "DELETE",
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          },
          keepalive: true,
        }
      );
    }

    window.addEventListener("beforeunload", deletePlayerFromDB);

    // Player kaydı + ilk state yükle
    supabase
      .from("players")
      .upsert({ id: playerId, room_id: roomId, name: playerName }, { onConflict: "id" })
      .then(() => loadState());

    // Socket.io bağlantısı
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ["websocket", "polling"], // WebSocket bloksa polling'e düş
    });

    socket.on("connect", () => {
      socket.emit("join", roomId);
    });

    // Başka biri DB'ye yazdı → state yenile
    socket.on("sync", () => {
      if (!unmounted.current) loadState();
    });

    // Emoji
    socket.on("emoji", ({ targetId, emoji }: { targetId: string; emoji: string }) => {
      spawnEmoji(targetId, emoji);
    });

    socketRef.current = socket;

    // Tab tekrar görünür olunca güncelle
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && !unmounted.current) loadState();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Fallback polling (socket da çalışmıyorsa)
    const pollInterval = setInterval(() => {
      if (!unmounted.current) loadState();
    }, 10000);

    return () => {
      window.removeEventListener("beforeunload", deletePlayerFromDB);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(pollInterval);
      unmounted.current = true;
      socket.disconnect();
    };
  }, [roomId, playerId, playerName]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendVote = useCallback(
    async (value: string) => {
      await supabase
        .from("votes")
        .upsert({ player_id: playerId, room_id: roomId, value }, { onConflict: "player_id" });
      await supabase.from("players").update({ has_voted: true }).eq("id", playerId);

      // Tüm oyuncular oy verdiyse otomatik kartları aç
      const { data: players } = await supabase
        .from("players")
        .select("has_voted")
        .eq("room_id", roomId);
      if (players && players.length > 0 && players.every((p) => p.has_voted)) {
        await supabase.from("rooms").update({ revealed: true }).eq("id", roomId);
      }

      socketRef.current?.emit("sync", roomId);
    },
    [roomId, playerId]
  );

  const sendReveal = useCallback(async () => {
    await supabase.from("rooms").update({ revealed: true }).eq("id", roomId);
    socketRef.current?.emit("sync", roomId);
  }, [roomId]);

  const sendReset = useCallback(async () => {
    setRoom((prev) => {
      if (!prev) return prev;
      const players: Record<string, Player> = {};
      for (const [id, p] of Object.entries(prev.players)) {
        players[id] = { ...p, hasVoted: false };
      }
      return { ...prev, players, votes: null, revealed: false };
    });
    await supabase.from("votes").delete().eq("room_id", roomId);
    await supabase.from("players").update({ has_voted: false }).eq("room_id", roomId);
    await supabase.from("rooms").update({ revealed: false }).eq("id", roomId);
    socketRef.current?.emit("sync", roomId);
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
