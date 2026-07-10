package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/zaide/unlimitedpoker/backend/internal/hub"
)

func HandleAction(h *hub.Hub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomID := r.PathValue("roomId")
		playerID := r.URL.Query().Get("playerId")

		var msg hub.IncomingMessage
		if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
			http.Error(w, "invalid body", http.StatusBadRequest)
			return
		}

		h.DispatchHTTPAction(roomID, playerID, msg)
		w.WriteHeader(http.StatusOK)
	}
}
