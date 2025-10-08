-- name: CreateSample :one
INSERT INTO samples (
  user_id, track_id, filename, file_size, s3_key, mime_type
) VALUES (
  $1, $2, $3, $4, $5, $6
)
RETURNING *;

-- name: GetSample :one
SELECT * FROM samples
WHERE id = $1 LIMIT 1;

-- name: GetUserSample :one
SELECT * FROM samples
WHERE id = $1 AND user_id = $2
LIMIT 1;

-- name: ListTrackSamples :many
SELECT * FROM samples
WHERE track_id = $1
ORDER BY created_at DESC;

-- name: ListUserSamples :many
SELECT * FROM samples
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: DeleteSample :exec
DELETE FROM samples
WHERE id = $1 AND user_id = $2;

-- name: GetUserTotalStorage :one
SELECT COALESCE(SUM(file_size), 0) as total_size
FROM samples
WHERE user_id = $1;

-- name: DeleteTrackSamples :exec
DELETE FROM samples
WHERE track_id = $1;