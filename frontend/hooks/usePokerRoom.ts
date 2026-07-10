"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getWSUrl, getSSEUrl, getActionUrl } from "@/lib/api";
import { WS_EVENTS } from "@/lib/constants";
import { Player, Room, WSMessage } from "@/lib/types";

export type ConnectionStatus = "connecting" | "open" | "closed" | "error";

interface UsePokerRoomReturn {
  room: Room | null;
  status: ConnectionStatus;
  myPlayerId: string;
  sendVote: (value: string) => void;
  sendReveal: () => void;
  sendReset: () => void;
}

export function usePokerRoom(
  roomId: string,
  playerId: string,
  playerName: string
): UsePokerRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const unmounted = useRef(false);
  const wsOpenedRef = useRef(false);
  const usePollRef = useRef(false);

  function handleMessage(msg: WSMessage) {
    switch (msg.event) {
      case WS_EVENTS.ROOM_STATE:
        setRoom(msg.payload as Room);
        break;

      case WS_EVENTS.PLAYER_JOINED: {
        const player = msg.payload as Player;
        setRoom((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: { ...prev.players, [player.id]: player },
          };
        });
        break;
      }

      case WS_EVENTS.PLAYER_LEFT: {
        const { playerId: leftId } = msg.payload as { playerId: string };
        setRoom((prev) => {
          if (!prev) return prev;
          const players = { ...prev.players };
          delete players[leftId];
          return { ...prev, players };
        });
        break;
      }

      case WS_EVENTS.VOTED: {
        const { playerId: votedId } = msg.payload as { playerId: string };
        setRoom((prev) => {
          if (!prev) return prev;
          const player = prev.players[votedId];
          if (!player) return prev;
          return {
            ...prev,
            players: {
              ...prev.players,
              [votedId]: { ...player, hasVoted: true },
            },
          };
        });
        break;
      }

      case WS_EVENTS.REVEALED: {
        const { votes } = msg.payload as { votes: Record<string, string> };
        setRoom((prev) => {
          if (!prev) return prev;
          return { ...prev, votes, revealed: true };
        });
        break;
      }

      case WS_EVENTS.RESET_DONE:
        setRoom((prev) => {
          if (!prev) return prev;
          const players: Record<string, Player> = {};
          for (const [id, p] of Object.entries(prev.players)) {
            players[id] = { ...p, hasVoted: false };
          }
          return { ...prev, players, votes: null, revealed: false };
        });
        break;
    }
  }

  const startPolling = useCallback(() => {
    if (unmounted.current) return;

    // Register player via join action
    fetch(getActionUrl(roomId, playerId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "join", payload: { playerId, playerName } }),
    }).catch(() => {});

    const poll = async () => {
      if (unmounted.current) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/rooms/${roomId}/snapshot`);
        if (res.ok) {
          const snap = await res.json();
          setRoom(snap);
          setStatus("open");
        }
      } catch {
        setStatus("error");
      }
    };

    poll();
    pollTimer.current = setInterval(poll, 2000);
  }, [roomId, playerId, playerName]); // eslint-disable-line react-hooks/exhaustive-deps

  const connect = useCallback(() => {
    if (unmounted.current) return;

    // If we already know SSE is required (e.g. after a previous WS failure),
    // skip straight to SSE.
    if (usePollRef.current) {
      startPolling();
      return;
    }

    wsOpenedRef.current = false;
    const ws = new WebSocket(getWSUrl(roomId));
    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => {
      wsOpenedRef.current = true;
      setStatus("open");
      reconnectAttempts.current = 0;
      // Send join event after connection
      ws.send(
        JSON.stringify({
          event: WS_EVENTS.JOIN,
          payload: { playerId: playerId, playerName: playerName },
        })
      );
      // Start keepalive
      pingTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ event: WS_EVENTS.PING, payload: {} }));
        }
      }, 25000);
    };

    ws.onmessage = (e) => {
      let msg: WSMessage;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      handleMessage(msg);
    };

    ws.onerror = () => {
      if (!wsOpenedRef.current) {
        // WebSocket was blocked before it could open — fall back to polling
        usePollRef.current = true;
        ws.close();
        startPolling();
        return;
      }
      setStatus("error");
    };

    ws.onclose = () => {
      if (unmounted.current) return;
      // If polling took over, ignore the WS close event
      if (usePollRef.current) return;

      setStatus("closed");
      if (pingTimer.current) clearInterval(pingTimer.current);

      // Exponential backoff: 1s, 2s, 4s, 8s, … capped at 30s
      const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
      reconnectAttempts.current += 1;
      reconnectTimer.current = setTimeout(connect, delay);
    };
  }, [roomId, playerId, playerName, startPolling]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = useCallback(
    (event: string, payload: unknown) => {
      if (usePollRef.current) {
        fetch(getActionUrl(roomId, playerId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event, payload }),
        }).catch(() => {});
      } else if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event, payload }));
      }
    },
    [roomId, playerId]
  );

  useEffect(() => {
    unmounted.current = false;
    connect();
    return () => {
      unmounted.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (pingTimer.current) clearInterval(pingTimer.current);
      wsRef.current?.close();
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [connect]);

  const sendVote = useCallback(
    (value: string) => send(WS_EVENTS.VOTE, { playerId: playerId, value }),
    [send, playerId]
  );

  const sendReveal = useCallback(
    () => send(WS_EVENTS.REVEAL, { playerId: playerId }),
    [send, playerId]
  );

  const sendReset = useCallback(
    () => send(WS_EVENTS.RESET, { playerId: playerId }),
    [send, playerId]
  );

  return { room, status, myPlayerId: playerId, sendVote, sendReveal, sendReset };
}
