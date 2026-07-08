package handlers

import (
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/zaide/unlimitedpoker/backend/internal/hub"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // origin check handled by CORS middleware
	},
}

func ServeWS(h *hub.Hub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomID := r.PathValue("roomId")
		if roomID == "" {
			http.Error(w, "missing roomId", http.StatusBadRequest)
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}

		h.SpawnClient(conn, roomID)
	}
}
