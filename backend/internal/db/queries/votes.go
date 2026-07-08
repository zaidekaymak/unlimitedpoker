package queries

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type VoteRow struct {
	PlayerID   string
	PlayerName string
	Value      string
}

func SaveVote(ctx context.Context, pool *pgxpool.Pool, roomID string, v VoteRow) error {
	_, err := pool.Exec(ctx, `
		INSERT INTO votes (room_id, player_id, player_name, value, voted_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (room_id, player_id) DO UPDATE
		  SET value = EXCLUDED.value,
		      voted_at = NOW()
	`, roomID, v.PlayerID, v.PlayerName, v.Value)
	if err != nil {
		return fmt.Errorf("save vote: %w", err)
	}
	return nil
}

func GetVotesByRoom(ctx context.Context, pool *pgxpool.Pool, roomID string) ([]VoteRow, error) {
	rows, err := pool.Query(ctx, `
		SELECT player_id, player_name, value FROM votes WHERE room_id = $1
	`, roomID)
	if err != nil {
		return nil, fmt.Errorf("get votes: %w", err)
	}
	defer rows.Close()

	var votes []VoteRow
	for rows.Next() {
		var v VoteRow
		if err := rows.Scan(&v.PlayerID, &v.PlayerName, &v.Value); err != nil {
			return nil, err
		}
		votes = append(votes, v)
	}
	return votes, nil
}

func ClearVotes(ctx context.Context, pool *pgxpool.Pool, roomID string) error {
	_, err := pool.Exec(ctx, `DELETE FROM votes WHERE room_id = $1`, roomID)
	if err != nil {
		return fmt.Errorf("clear votes: %w", err)
	}
	return nil
}
