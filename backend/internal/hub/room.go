package hub

import "sync"

type Player struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	IsAdmin  bool   `json:"isAdmin"`
	HasVoted bool   `json:"hasVoted"`
}

type Room struct {
	mu      sync.RWMutex
	ID      string             `json:"id"`
	Name    string             `json:"name"`
	AdminID string             `json:"adminId"`
	Players map[string]*Player `json:"players"`
	Votes   map[string]string  `json:"votes"`   // nil until revealed
	Revealed bool              `json:"revealed"`
}

func NewRoom(id, name, adminID string) *Room {
	return &Room{
		ID:      id,
		Name:    name,
		AdminID: adminID,
		Players: make(map[string]*Player),
		Votes:   nil,
	}
}

// Snapshot returns a JSON-safe copy for broadcasting.
// If not revealed, Votes is omitted (nil) and only HasVoted is exposed.
func (r *Room) Snapshot() roomSnapshot {
	r.mu.RLock()
	defer r.mu.RUnlock()

	players := make(map[string]playerSnapshot, len(r.Players))
	for id, p := range r.Players {
		players[id] = playerSnapshot{
			ID:       p.ID,
			Name:     p.Name,
			IsAdmin:  p.IsAdmin,
			HasVoted: p.HasVoted,
		}
	}

	var votes map[string]string
	if r.Revealed {
		votes = make(map[string]string, len(r.Votes))
		for k, v := range r.Votes {
			votes[k] = v
		}
	}

	return roomSnapshot{
		ID:       r.ID,
		Name:     r.Name,
		AdminID:  r.AdminID,
		Players:  players,
		Votes:    votes,
		Revealed: r.Revealed,
	}
}

type roomSnapshot struct {
	ID       string                    `json:"id"`
	Name     string                    `json:"name"`
	AdminID  string                    `json:"adminId"`
	Players  map[string]playerSnapshot `json:"players"`
	Votes    map[string]string         `json:"votes"`
	Revealed bool                      `json:"revealed"`
}

type playerSnapshot struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	IsAdmin  bool   `json:"isAdmin"`
	HasVoted bool   `json:"hasVoted"`
}
