package hub

// noopClient is a placeholder IClient used when an action originates from an
// HTTP request (no persistent connection to send responses back on).
type noopClient struct {
	rID string
	pID string
}

func (c *noopClient) sendJSON(_ string, _ any) {}
func (c *noopClient) disconnect()              {}
func (c *noopClient) getRoomID() string        { return c.rID }
func (c *noopClient) getPlayerID() string      { return c.pID }
func (c *noopClient) setPlayerID(id string)    { c.pID = id }
func (c *noopClient) pendingKey() string       { return "_noop_" + c.pID }
func (c *noopClient) getSend() chan []byte      { return nil }
