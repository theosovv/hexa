# 🎵 Hexa - Modular Web Synthesizer

Кроссплатформенная DAW с акцентом на live-перформанс и стриминг.

## Tech Stack

**Frontend:**
- SolidJS + TypeScript
- Panda CSS
- Web Audio API
- Custom SVG Canvas

**Backend:**
- Go + Fiber
- PostgreSQL
- MinIO (S3-compatible)
- sqlc + golang-migrate

## Quick Start

### Prerequisites

- Node.js 22+
- Go 1.25+
- Docker & Docker Compose

### Installation

```bash
# Clone repository
git clone https://github.com/theosovv/hexa.git
cd hexa

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install Go tools
go install github.com/air-verse/air@latest
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

# Install global tools
npm install -g concurrently
```

### Development

```bash
# 1. Start databases (PostgreSQL + MinIO)
npm run services

# 2. Apply migrations (first time only)
npm run db:migrate

# 3. Generate sqlc code (first time only)
npm run db:sqlc

# 4. Start dev servers (backend + frontend with hot-reload)
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- MinIO Console: http://localhost:9001 (hexa_admin / hexa_secret_key_123)

## Available Commands

### Development
```bash
npm run dev              # Start backend + frontend
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
npm run services         # Start databases
npm run services:stop    # Stop databases
```

### Database
```bash
npm run db:migrate           # Apply migrations
npm run db:migrate:down      # Rollback last migration
npm run db:sqlc              # Generate Go code from SQL
NAME=migration_name npm run db:migrate:create  # Create new migration
```

### Code Quality
```bash
npm run lint             # Lint all
npm run format           # Format all
npm run build            # Build all
```

## Project Structure