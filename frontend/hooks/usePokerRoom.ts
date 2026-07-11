"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
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
      // keepalive: tarayıcı kapanırken bile isteği tamamla
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

    // Register/upsert self as player then load full state
    supabase
      .from("players")
      .upsert({ id: playerId, room_id: roomId, name: playerName }, { onConflict: "id" })
      .then(() => loadState());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase.channel(`room:${roomId}`) as any)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload: { new: { id: string; name: string; revealed: boolean } }) => {
          const updated = payload.new;
          setRoom((prev) => {
            if (!prev) return prev;
            const wasRevealed = prev.revealed;
            if (wasRevealed && !updated.revealed) {
              // Reset happened: clear votes
              return { ...prev, revealed: false, votes: null };
            }
            return { ...prev, revealed: updated.revealed };
          });
          if (updated.revealed) {
            // Fetch votes now that they're revealed
            supabase
              .from("votes")
              .select("*")
              .eq("room_id", roomId)
              .then(({ data }) => {
                if (!data) return;
                const votes: Record<string, string> = {};
                for (const v of data) votes[v.player_id] = v.value;
                setRoom((prev) => (prev ? { ...prev, votes } : prev));
              });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "players", filter: `room_id=eq.${roomId}` },
        (payload: { new: { id: string; name: string; has_voted: boolean } }) => {
          const p = payload.new;
          setRoom((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              players: { ...prev.players, [p.id]: { id: p.id, name: p.name, isAdmin: false, hasVoted: p.has_voted } },
            };
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "players", filter: `room_id=eq.${roomId}` },
        (payload: { new: { id: string; name: string; has_voted: boolean } }) => {
          const p = payload.new;
          setRoom((prev) => {
            if (!prev) return prev;
            const existing = prev.players[p.id];
            if (!existing) return prev;
            return {
              ...prev,
              players: { ...prev.players, [p.id]: { ...existing, hasVoted: p.has_voted } },
            };
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "players" },
        (payload: { old: { id: string; room_id: string } }) => {
          const { id, room_id } = payload.old;
          if (room_id !== roomId) return;
          setRoom((prev) => {
            if (!prev) return prev;
            const players = { ...prev.players };
            delete players[id];
            return { ...prev, players };
          });
        }
      )
      .on("broadcast", { event: "emoji" }, ({ payload }: { payload: { targetId: string; emoji: string } }) => {
        spawnEmoji(payload.targetId, payload.emoji);
      })
      .subscribe((status: string) => {
        // Subscription başarısız olursa state'i yeniden yükle
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          if (!unmounted.current) loadState();
        }
      });

    channelRef.current = channel;

    // Polling fallback: Realtime olayları gelmediyse 3sn'de bir taze veri çek
    const pollInterval = setInterval(() => {
      if (!unmounted.current) loadState();
    }, 3000);

    // Tab tekrar görünür olunca anında güncelle
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && !unmounted.current) loadState();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", deletePlayerFromDB);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(pollInterval);
      unmounted.current = true;
      channel.unsubscribe();
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
    },
    [roomId, playerId]
  );

  const sendReveal = useCallback(async () => {
    await supabase.from("rooms").update({ revealed: true }).eq("id", roomId);
  }, [roomId]);

  const sendReset = useCallback(async () => {
    // Optimistic local update
    setRoom((prev) => {
      if (!prev) return prev;
      const players: Record<string, Player> = {};
      for (const [id, p] of Object.entries(prev.players)) {
        players[id] = { ...p, hasVoted: false };
      }
      return { ...prev, players, votes: null, revealed: false };
    });
    // Persist to DB (triggers Realtime for other clients)
    await supabase.from("votes").delete().eq("room_id", roomId);
    await supabase.from("players").update({ has_voted: false }).eq("room_id", roomId);
    await supabase.from("rooms").update({ revealed: false }).eq("id", roomId);
  }, [roomId]);

  const sendEmoji = useCallback(
    (targetId: string, emoji: string) => {
      // Local echo (sender sees it immediately)
      spawnEmoji(targetId, emoji);
      // Broadcast to all other clients via Supabase Realtime
      channelRef.current?.send({ type: "broadcast", event: "emoji", payload: { targetId, emoji } });
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { room, sendVote, sendReveal, sendReset, sendEmoji, emojiEvents };
}
