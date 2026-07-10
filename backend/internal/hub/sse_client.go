package hub

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// SSEClient implements IClient over HTTP Server-Sent Events.
type SSEClient struct {
	hub     *Hub
	w       http.ResponseWriter
	flusher http.Flusher
	send    chan []byte
	rID     string
	pID     string
	key     string
}

// IClient interface implementation

func (c *SSEClient) getRoomID() string      { return c.rID }
func (c *SSEClient) getPlayerID() string    { return c.pID }
func (c *SSEClient) setPlayerID(id string)  { c.pID = id }
func (c *SSEClient) disconnect()            { close(c.send) }
func (c *SSEClient) getSend() chan []byte   { return c.send }
func (c *SSEClient) pendingKey() string     { return c.key }

func (c *SSEClient) sendJSON(event string, payload any) {
	data, err := json.Marshal(OutgoingMessage{Event: event, Payload: payload})
	if err != nil {
		log.Printf("sse marshal error: %v", err)
		return
	}
	select {
	case c.send <- data:
	default:
		log.Printf("dropping sse message for slow client %s", c.pID)
	}
}

// Serve reads from the send channel and writes SSE frames until ctx is done
// or the send channel is closed. This call blocks.
func (c *SSEClient) Serve(ctx context.Context) {
	keepalive := time.NewTicker(25 * time.Second)
	defer keepalive.Stop()

	for {
		select {
		case <-ctx.Done():
			return

		case <-keepalive.C:
			// SSE comment line — keeps the connection alive through proxies
			fmt.Fprintf(c.w, ": keepalive\n\n")
			c.flusher.Flush()

		case msg, ok := <-c.send:
			if !ok {
				return
			}
			fmt.Fprintf(c.w, "data: %s\n\n", msg)
			c.flusher.Flush()
		}
	}
}

// SpawnSSEClient sets SSE headers, registers the client, dispatches a join
// action, blocks until the connection closes, then unregisters the client.
func SpawnSSEClient(h *Hub, w http.ResponseWriter, r *http.Request, roomID, playerID, playerName string) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming not supported", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	joinPayload, err := json.Marshal(JoinPayload{PlayerID: playerID, PlayerName: playerName})
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	c := &SSEClient{
		hub:     h,
		w:       w,
		flusher: flusher,
		send:    make(chan []byte, 256),
		rID:     roomID,
		pID:     playerID,
		key:     "_pending_sse_" + playerID,
	}

	h.register <- c

	// Dispatch join on behalf of the SSE client
	h.broadcast <- action{
		client: c,
		msg: IncomingMessage{
			Event:   EventJoin,
			Payload: joinPayload,
		},
	}

	c.Serve(r.Context())

	h.unregister <- c
}
