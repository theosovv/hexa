-- name: ListScenesByTrack :many
SELECT id, track_id, name, state_data, position, created_at
FROM scenes
WHERE track_id = $1
ORDER BY position ASC, created_at ASC;

-- name: GetScene :one
SELECT id, track_id, name, state_data, position, created_at
FROM scenes
WHERE id = $1
LIMIT 1;

-- name: CreateScene :one
INSERT INTO scenes (id, track_id, name, state_data, position)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, track_id, name, state_data, position, created_at;

-- name: UpdateScene :one
UPDATE scenes
SET name = $2,
    state_data = $3,
    position = $4
WHERE id = $1
RETURNING id, track_id, name, state_data, position, created_at;

-- name: DeleteScene :exec
DELETE FROM scenes
WHERE id = $1;