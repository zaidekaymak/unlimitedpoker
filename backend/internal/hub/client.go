package hub

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = 54 * time.Second
	maxMessageSize = 4096
)

type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan []byte
	roomID   string
	playerID string
}

// SpawnClient creates a Client, registers it with the hub, and starts its goroutines.
func (h *Hub) SpawnClient(conn *websocket.Conn, roomID string) {
	c := &Client{
		hub:    h,
		conn:   conn,
		send:   make(chan []byte, 256),
		roomID: roomID,
	}
	h.register <- c
	go c.writePump()
	go c.readPump()
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, raw, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("ws read error: %v", err)
			}
			break
		}

		var msg IncomingMessage
		if err := json.Unmarshal(raw, &msg); err != nil {
			log.Printf("unmarshal error: %v", err)
			continue
		}

		c.hub.broadcast <- action{client: c, msg: msg}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *Client) sendJSON(event string, payload any) {
	data, err := json.Marshal(OutgoingMessage{Event: event, Payload: payload})
	if err != nil {
		log.Printf("marshal error: %v", err)
		return
	}
	select {
	case c.send <- data:
	default:
		log.Printf("dropping message for slow client %s", c.playerID)
	}
}

// IClient implementation

func (c *Client) getRoomID() string        { return c.roomID }
func (c *Client) getPlayerID() string      { return c.playerID }
func (c *Client) setPlayerID(id string)    { c.playerID = id }
func (c *Client) disconnect()              { close(c.send) }
func (c *Client) getSend() chan []byte     { return c.send }
func (c *Client) pendingKey() string       { return "_pending_ws_" + c.conn.RemoteAddr().String() }
