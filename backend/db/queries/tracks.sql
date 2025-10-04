-- name: ListUserTracks :many
SELECT * FROM tracks
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: GetTrack :one
SELECT * FROM tracks
WHERE id = $1 LIMIT 1;

-- name: CreateTrack :one
INSERT INTO tracks (
  user_id, title, description, bpm, graph_data
) VALUES (
  $1, $2, $3, $4, $5
)
RETURNING *;

-- name: UpdateTrack :one
UPDATE tracks
SET title = $2, description = $3, bpm = $4, graph_data = $5, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteTrack :exec
DELETE FROM tracks
WHERE id = $1;

-- name: GetPublicTrack :one
SELECT * FROM tracks
WHERE id = $1 AND is_public = true
LIMIT 1;