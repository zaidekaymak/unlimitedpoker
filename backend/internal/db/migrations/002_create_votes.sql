CREATE TABLE IF NOT EXISTS votes (
    room_id     TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    player_id   TEXT NOT NULL,
    player_name TEXT NOT NULL,
    value       TEXT NOT NULL,
    voted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (room_id, player_id)
);
