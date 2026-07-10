package hub

import (
	"context"
	"encoding/json"
	"log"
	"sync"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zaide/unlimitedpoker/backend/internal/db/queries"
)

type action struct {
	client IClient
	msg    IncomingMessage
}

type createRoomCmd struct {
	id      string
	name    string
	adminID string
}

type Hub struct {
	rooms       map[string]*Room
	clients     map[string]map[string]IClient // roomID → key → IClient
	broadcast   chan action
	register    chan IClient
	unregister  chan IClient
	createRoom  chan createRoomCmd
	db          *pgxpool.Pool
	snapshots   map[string][]byte
	snapshotsMu sync.RWMutex
}

func NewHub(db *pgxpool.Pool) *Hub {
	return &Hub{
		rooms:      make(map[string]*Room),
		clients:    make(map[string]map[string]IClient),
		broadcast:  make(chan action, 256),
		register:   make(chan IClient, 32),
		unregister: make(chan IClient, 32),
		createRoom: make(chan createRoomCmd, 32),
		db:         db,
		snapshots:  make(map[string][]byte),
	}
}

// updateSnapshot caches a JSON snapshot of the room. Must be called from the hub goroutine.
func (h *Hub) updateSnapshot(roomID string) {
	room, ok := h.rooms[roomID]
	if !ok {
		return
	}
	snap := room.Snapshot()
	data, err := json.Marshal(snap)
	if err != nil {
		return
	}
	h.snapshotsMu.Lock()
	h.snapshots[roomID] = data
	h.snapshotsMu.Unlock()
}

// GetSnapshot returns the latest cached room snapshot. Safe to call from any goroutine.
func (h *Hub) GetSnapshot(roomID string) []byte {
	h.snapshotsMu.RLock()
	data := h.snapshots[roomID]
	h.snapshotsMu.RUnlock()
	return data
}

// CreateRoom schedules room creation on the hub goroutine (safe from any goroutine).
func (h *Hub) CreateRoom(id, name, adminID string) {
	h.createRoom <- createRoomCmd{id: id, name: name, adminID: adminID}
}

// DispatchHTTPAction sends an action to the hub from an HTTP handler.
// A noopClient is used as the sender; the join event must not be sent via
// this path (only SSE connect handles join).
func (h *Hub) DispatchHTTPAction(roomID, playerID string, msg IncomingMessage) {
	c := &noopClient{rID: roomID, pID: playerID}
	h.broadcast <- action{client: c, msg: msg}
}

func (h *Hub) Run() {
	for {
		select {
		case cmd := <-h.createRoom:
			if _, ok := h.rooms[cmd.id]; !ok {
				h.rooms[cmd.id] = NewRoom(cmd.id, cmd.name, cmd.adminID)
				h.clients[cmd.id] = make(map[string]IClient)
			}

		case c := <-h.register:
			if h.clients[c.getRoomID()] == nil {
				h.clients[c.getRoomID()] = make(map[string]IClient)
			}
			h.clients[c.getRoomID()][c.pendingKey()] = c

		case c := <-h.unregister:
			if roomClients, ok := h.clients[c.getRoomID()]; ok {
				for key, client := range roomClients {
					if client == c {
						delete(roomClients, key)
						break
					}
				}
				c.disconnect()
				if room, ok := h.rooms[c.getRoomID()]; ok && c.getPlayerID() != "" {
					room.mu.Lock()
					delete(room.Players, c.getPlayerID())
					room.mu.Unlock()
					h.broadcastToRoom(c.getRoomID(), EventPlayerLeft, PlayerLeftPayload{PlayerID: c.getPlayerID()})
				}
			}

		case a := <-h.broadcast:
			h.handleAction(a)
		}
	}
}

func (h *Hub) handleAction(a action) {
	c := a.client
	msg := a.msg

	switch msg.Event {
	case EventJoin:
		var p JoinPayload
		if err := json.Unmarshal(msg.Payload, &p); err != nil {
			c.sendJSON(EventError, ErrorPayload{Message: "invalid join payload"})
			return
		}

		room, ok := h.rooms[c.getRoomID()]
		if !ok {
			// Room not in memory — load from DB (server restart recovery)
			row, err := queries.GetRoom(context.Background(), h.db, c.getRoomID())
			if err != nil {
				c.sendJSON(EventError, ErrorPayload{Message: "room not found"})
				return
			}
			room = NewRoom(row.ID, row.Name, row.AdminID)
			h.rooms[c.getRoomID()] = room
			h.clients[c.getRoomID()] = make(map[string]IClient)

			// Restore votes from DB if revealed
			if row.Revealed {
				room.Revealed = true
				dbVotes, err := queries.GetVotesByRoom(context.Background(), h.db, c.getRoomID())
				if err == nil {
					room.Votes = make(map[string]string, len(dbVotes))
					for _, v := range dbVotes {
						room.Votes[v.PlayerID] = v.Value
					}
				}
			}
		}

		// Re-key client from pending to playerID
		if roomClients, ok := h.clients[c.getRoomID()]; ok {
			for key, client := range roomClients {
				if client == c {
					delete(roomClients, key)
					break
				}
			}
			roomClients[p.PlayerID] = c
		}
		c.setPlayerID(p.PlayerID)

		room.mu.Lock()
		player := &Player{
			ID:      p.PlayerID,
			Name:    p.PlayerName,
			IsAdmin: room.AdminID == p.PlayerID,
		}
		room.Players[p.PlayerID] = player
		room.mu.Unlock()

		h.updateSnapshot(c.getRoomID())
		c.sendJSON(EventRoomState, room.Snapshot())
		h.broadcastToRoomExcept(c.getRoomID(), p.PlayerID, EventPlayerJoined, playerSnapshot{
			ID:      player.ID,
			Name:    player.Name,
			IsAdmin: player.IsAdmin,
		})

	case EventVote:
		var p VotePayload
		if err := json.Unmarshal(msg.Payload, &p); err != nil {
			c.sendJSON(EventError, ErrorPayload{Message: "invalid vote payload"})
			return
		}

		room, ok := h.rooms[c.getRoomID()]
		if !ok {
			return
		}

		room.mu.Lock()
		if room.Revealed {
			room.mu.Unlock()
			c.sendJSON(EventError, ErrorPayload{Message: "voting closed, reset first"})
			return
		}
		if room.Votes == nil {
			room.Votes = make(map[string]string)
		}
		room.Votes[p.PlayerID] = p.Value
		playerName := ""
		if player, ok := room.Players[p.PlayerID]; ok {
			player.HasVoted = true
			playerName = player.Name
		}
		allVoted := len(room.Players) > 0
		for _, player := range room.Players {
			if !player.HasVoted {
				allVoted = false
				break
			}
		}
		var revealVotes map[string]string
		if allVoted {
			room.Revealed = true
			revealVotes = make(map[string]string, len(room.Votes))
			for k, v := range room.Votes {
				revealVotes[k] = v
			}
		}
		room.mu.Unlock()

		go func() {
			if err := queries.SaveVote(context.Background(), h.db, c.getRoomID(), queries.VoteRow{
				PlayerID:   p.PlayerID,
				PlayerName: playerName,
				Value:      p.Value,
			}); err != nil {
				log.Printf("save vote: %v", err)
			}
		}()

		h.updateSnapshot(c.getRoomID())
		h.broadcastToRoom(c.getRoomID(), EventVoted, VotedPayload{PlayerID: p.PlayerID})

		if allVoted {
			go func() {
				if err := queries.SetRevealed(context.Background(), h.db, c.getRoomID(), true); err != nil {
					log.Printf("set revealed: %v", err)
				}
			}()
			h.broadcastToRoom(c.getRoomID(), EventRevealed, RevealedPayload{Votes: revealVotes})
		}

	case EventReveal:
		var p RevealPayload
		if err := json.Unmarshal(msg.Payload, &p); err != nil {
			return
		}

		room, ok := h.rooms[c.getRoomID()]
		if !ok {
			return
		}

		room.mu.Lock()
		room.Revealed = true
		votes := make(map[string]string, len(room.Votes))
		for k, v := range room.Votes {
			votes[k] = v
		}
		room.mu.Unlock()

		go func() {
			if err := queries.SetRevealed(context.Background(), h.db, c.getRoomID(), true); err != nil {
				log.Printf("set revealed: %v", err)
			}
		}()

		h.updateSnapshot(c.getRoomID())
		h.broadcastToRoom(c.getRoomID(), EventRevealed, RevealedPayload{Votes: votes})

	case EventReset:
		var p ResetPayload
		if err := json.Unmarshal(msg.Payload, &p); err != nil {
			return
		}

		room, ok := h.rooms[c.getRoomID()]
		if !ok {
			return
		}

		room.mu.Lock()
		room.Revealed = false
		room.Votes = nil
		for _, player := range room.Players {
			player.HasVoted = false
		}
		room.mu.Unlock()

		go func() {
			if err := queries.ClearVotes(context.Background(), h.db, c.getRoomID()); err != nil {
				log.Printf("clear votes: %v", err)
			}
			if err := queries.SetRevealed(context.Background(), h.db, c.getRoomID(), false); err != nil {
				log.Printf("set revealed false: %v", err)
			}
		}()

		h.updateSnapshot(c.getRoomID())
		h.broadcastToRoom(c.getRoomID(), EventResetDone, nil)

	case EventPing:
		c.sendJSON(EventPong, nil)
	}
}

func (h *Hub) broadcastToRoom(roomID, event string, payload any) {
	data, err := json.Marshal(OutgoingMessage{Event: event, Payload: payload})
	if err != nil {
		return
	}
	for _, c := range h.clients[roomID] {
		select {
		case c.getSend() <- data:
		default:
		}
	}
}

func (h *Hub) broadcastToRoomExcept(roomID, excludePlayerID, event string, payload any) {
	data, err := json.Marshal(OutgoingMessage{Event: event, Payload: payload})
	if err != nil {
		return
	}
	for pid, c := range h.clients[roomID] {
		if pid == excludePlayerID {
			continue
		}
		select {
		case c.getSend() <- data:
		default:
		}
	}
}
