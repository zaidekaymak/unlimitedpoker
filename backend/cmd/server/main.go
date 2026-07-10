package main

import (
	"context"
	"log"
	"net/http"

	"github.com/zaide/unlimitedpoker/backend/internal/config"
	"github.com/zaide/unlimitedpoker/backend/internal/db"
	"github.com/zaide/unlimitedpoker/backend/internal/handlers"
	"github.com/zaide/unlimitedpoker/backend/internal/hub"
	"github.com/zaide/unlimitedpoker/backend/internal/middleware"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()

	pool, err := db.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer pool.Close()

	if err := db.RunMigrations(ctx, pool); err != nil {
		log.Fatalf("migrations: %v", err)
	}

	h := hub.NewHub(pool)
	go h.Run()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", handlers.Health)
	mux.HandleFunc("POST /rooms", handlers.CreateRoom(h, pool))
	mux.HandleFunc("GET /rooms/{roomId}", handlers.GetRoom(pool))
	mux.HandleFunc("GET /rooms/{roomId}/snapshot", handlers.GetRoomSnapshot(h))
	mux.HandleFunc("GET /ws/{roomId}", handlers.ServeWS(h))
	mux.HandleFunc("GET /sse/{roomId}", handlers.ServeSSE(h))
	mux.HandleFunc("POST /rooms/{roomId}/action", handlers.HandleAction(h))

	cors := middleware.CORS(cfg.CORSOrigin)

	log.Printf("listening on :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, cors(mux)); err != nil {
		log.Fatalf("server: %v", err)
	}
}
