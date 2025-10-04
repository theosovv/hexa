-- name: GetUser :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 LIMIT 1;

-- name: GetUserByOAuth :one
SELECT * FROM users
WHERE oauth_provider = $1 AND oauth_id = $2
LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (
  email, display_name, avatar_url, oauth_provider, oauth_id
) VALUES (
  $1, $2, $3, $4, $5
)
RETURNING *;

-- name: UpdateUser :one
UPDATE users
SET display_name = $2, avatar_url = $3, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: UpdateUserStorage :exec
UPDATE users
SET storage_used = $2, updated_at = NOW()
WHERE id = $1;

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;