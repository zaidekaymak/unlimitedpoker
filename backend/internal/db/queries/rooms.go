package queries

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type RoomRow struct {
	ID       string
	Name     string
	AdminID  string
	Revealed bool
}

func UpsertRoom(ctx context.Context, pool *pgxpool.Pool, r RoomRow) error {
	_, err := pool.Exec(ctx, `
		INSERT INTO rooms (id, name, admin_id, revealed, updated_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (id) DO UPDATE
		  SET name = EXCLUDED.name,
		      revealed = EXCLUDED.revealed,
		      updated_at = NOW()
	`, r.ID, r.Name, r.AdminID, r.Revealed)
	if err != nil {
		return fmt.Errorf("upsert room: %w", err)
	}
	return nil
}

func GetRoom(ctx context.Context, pool *pgxpool.Pool, id string) (*RoomRow, error) {
	row := pool.QueryRow(ctx, `
		SELECT id, name, admin_id, revealed FROM rooms WHERE id = $1
	`, id)

	var r RoomRow
	if err := row.Scan(&r.ID, &r.Name, &r.AdminID, &r.Revealed); err != nil {
		return nil, err
	}
	return &r, nil
}

func SetRevealed(ctx context.Context, pool *pgxpool.Pool, roomID string, revealed bool) error {
	_, err := pool.Exec(ctx, `
		UPDATE rooms SET revealed = $1, updated_at = NOW() WHERE id = $2
	`, revealed, roomID)
	return err
}
