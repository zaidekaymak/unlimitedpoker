package hub

// IClient is the interface implemented by both WebSocket and SSE clients.
type IClient interface {
	sendJSON(event string, payload any)
	disconnect()
	getRoomID() string
	getPlayerID() string
	setPlayerID(id string)
	// pendingKey returns the unique map key used before the playerID is known.
	pendingKey() string
	// getSend returns the send channel so the hub can write raw bytes.
	getSend() chan []byte
}
