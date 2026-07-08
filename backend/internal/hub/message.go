package hub

import "encoding/json"

// Client → Server events
const (
	EventJoin   = "join"
	EventVote   = "vote"
	EventReveal = "reveal"
	EventReset  = "reset"
	EventPing   = "ping"
)

// Server → Client events
const (
	EventRoomState    = "room_state"
	EventPlayerJoined = "player_joined"
	EventPlayerLeft   = "player_left"
	EventVoted        = "voted"
	EventRevealed     = "revealed"
	EventResetDone    = "reset"
	EventError        = "error"
	EventPong         = "pong"
)

type IncomingMessage struct {
	Event   string          `json:"event"`
	Payload json.RawMessage `json:"payload"`
}

type OutgoingMessage struct {
	Event   string `json:"event"`
	Payload any    `json:"payload"`
}

// Payloads for client → server
type JoinPayload struct {
	PlayerID   string `json:"playerId"`
	PlayerName string `json:"playerName"`
}

type VotePayload struct {
	PlayerID string `json:"playerId"`
	Value    string `json:"value"`
}

type RevealPayload struct {
	PlayerID string `json:"playerId"`
}

type ResetPayload struct {
	PlayerID string `json:"playerId"`
}

// Payloads for server → client
type VotedPayload struct {
	PlayerID string `json:"playerId"`
}

type PlayerLeftPayload struct {
	PlayerID string `json:"playerId"`
}

type RevealedPayload struct {
	Votes map[string]string `json:"votes"`
}

type ErrorPayload struct {
	Message string `json:"message"`
}
