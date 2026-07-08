export const FIBONACCI = ["1", "2", "3", "5", "8", "13", "21", "?"] as const;
export type FibValue = (typeof FIBONACCI)[number];

export const WS_EVENTS = {
  JOIN: "join",
  VOTE: "vote",
  REVEAL: "reveal",
  RESET: "reset",
  PING: "ping",
  ROOM_STATE: "room_state",
  PLAYER_JOINED: "player_joined",
  PLAYER_LEFT: "player_left",
  VOTED: "voted",
  REVEALED: "revealed",
  RESET_DONE: "reset",
  ERROR: "error",
  PONG: "pong",
} as const;
