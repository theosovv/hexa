.PHONY: fmt lint test run build migrate-up migrate-down migrate-create sqlc help

help:
	@echo "Available commands:"
	@echo "  make fmt           - Format code"
	@echo "  make lint          - Run linter"
	@echo "  make test          - Run tests"
	@echo "  make run           - Run server"
	@echo "  make build         - Build binary"
	@echo "  make migrate-up    - Apply migrations"
	@echo "  make migrate-down  - Rollback migrations"
	@echo "  make migrate-create NAME=migration_name - Create new migration"
	@echo "  make sqlc          - Generate sqlc code"

fmt:
	go fmt ./...
	goimports -w .

lint:
	golangci-lint run

test:
	go test -v ./...

run:
	go run cmd/server/main.go

dev:
	air

dev-no-reload:
	go run cmd/server/main.go

build:
	go build -o bin/server cmd/server/main.go

# Миграции
DB_URL := postgres://hexa_user:hexa_password@localhost:5432/hexa?sslmode=disable

migrate-up:
	migrate -path db/migrations -database "$(DB_URL)" -verbose up

migrate-down:
	migrate -path db/migrations -database "$(DB_URL)" -verbose down 1

migrate-create:
	migrate create -ext sql -dir db/migrations -seq $(NAME)

# Генерация sqlc
sqlc:
	sqlc generate