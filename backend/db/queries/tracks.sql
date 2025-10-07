-- name: ListUserTracks :many
SELECT * FROM tracks
WHERE user_id = $1
ORDER BY updated_at DESC;

-- name: GetTrack :one
SELECT * FROM tracks
WHERE id = $1 LIMIT 1;

-- name: GetUserTrack :one
SELECT * FROM tracks
WHERE id = $1 AND user_id = $2
LIMIT 1;

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
WHERE id = $1 AND user_id = $6
RETURNING *;

-- name: UpdateTrackGraph :one
UPDATE tracks
SET graph_data = $2, updated_at = NOW()
WHERE id = $1 AND user_id = $3
RETURNING *;

-- name: DeleteTrack :exec
DELETE FROM tracks
WHERE id = $1 AND user_id = $2;

-- name: SetTrackPublic :one
UPDATE tracks
SET is_public = $2, updated_at = NOW()
WHERE id = $1 AND user_id = $3
RETURNING *;

-- name: GetPublicTrack :one
SELECT * FROM tracks
WHERE id = $1 AND is_public = true
LIMIT 1;

-- name: ListPublicTracks :many
SELECT * FROM tracks
WHERE is_public = true
ORDER BY updated_at DESC
LIMIT $1 OFFSET $2;