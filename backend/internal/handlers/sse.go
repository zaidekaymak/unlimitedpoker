package handlers

import (
	"net/http"

	"github.com/zaide/unlimitedpoker/backend/internal/hub"
)

func ServeSSE(h *hub.Hub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomID := r.PathValue("roomId")
		playerID := r.URL.Query().Get("playerId")
		playerName := r.URL.Query().Get("playerName")
		if roomID == "" || playerID == "" || playerName == "" {
			http.Error(w, "missing params", http.StatusBadRequest)
			return
		}
		hub.SpawnSSEClient(h, w, r, roomID, playerID, playerName)
	}
}
