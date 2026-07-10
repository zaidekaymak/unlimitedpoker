package handlers

import (
	"encoding/json"
	"math/rand"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zaide/unlimitedpoker/backend/internal/db/queries"
	"github.com/zaide/unlimitedpoker/backend/internal/hub"
)

type createRoomRequest struct {
	Name      string `json:"name"`
	AdminName string `json:"adminName"`
}

type createRoomResponse struct {
	RoomID        string `json:"roomId"`
	AdminID       string `json:"adminId"`
	AdminPlayerID string `json:"adminPlayerId"`
}

func CreateRoom(h *hub.Hub, db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createRoomRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Name == "" || req.AdminName == "" {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		roomID := nanoid(8)
		adminPlayerID := nanoid(12)

		if err := queries.UpsertRoom(r.Context(), db, queries.RoomRow{
			ID:      roomID,
			Name:    req.Name,
			AdminID: adminPlayerID,
		}); err != nil {
			http.Error(w, "could not create room", http.StatusInternalServerError)
			return
		}

		h.CreateRoom(roomID, req.Name, adminPlayerID)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(createRoomResponse{
			RoomID:        roomID,
			AdminID:       adminPlayerID,
			AdminPlayerID: adminPlayerID,
		})
	}
}

func GetRoom(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomID := r.PathValue("roomId")
		row, err := queries.GetRoom(r.Context(), db, roomID)
		if err != nil {
			http.Error(w, "room not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(row)
	}
}

func GetRoomSnapshot(h *hub.Hub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomID := r.PathValue("roomId")
		data := h.GetSnapshot(roomID)
		if data == nil {
			http.Error(w, "room not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(data)
	}
}

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func nanoid(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}
