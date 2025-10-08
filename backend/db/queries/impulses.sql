-- name: CreateImpulse :one
INSERT INTO reverb_impulses (
  user_id, track_id, filename, file_size, s3_key, mime_type
) VALUES (
  $1, $2, $3, $4, $5, $6
)
RETURNING *;

-- name: GetImpulse :one
SELECT * FROM reverb_impulses
WHERE id = $1
LIMIT 1;

-- name: GetUserImpulse :one
SELECT * FROM reverb_impulses
WHERE id = $1 AND user_id = $2
LIMIT 1;

-- name: ListTrackImpulses :many
SELECT * FROM reverb_impulses
WHERE track_id = $1
ORDER BY created_at DESC;

-- name: DeleteImpulse :exec
DELETE FROM reverb_impulses
WHERE id = $1 AND user_id = $2;