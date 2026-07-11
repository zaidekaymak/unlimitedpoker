export interface Player {
  id: string;
  name: string;
  isAdmin: boolean;
  hasVoted: boolean;
}

export interface Room {
  id: string;
  name: string;
  adminId: string;
  players: Record<string, Player>;
  votes: Record<string, string> | null;
  revealed: boolean;
}

export interface WSMessage {
  event: string;
  payload: unknown;
}

export interface EmojiEvent {
  id: number;
  emoji: string;
  targetPlayerId: string;
}
