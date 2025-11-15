# ziptie-mvp-backend

ZipTie’s monolithic MVP backend. It exposes REST endpoints for authentication, user management, API keys, and creating/consuming branded short links while coordinating Redis, Prisma, and the dedicated Redis microservice.

## Stack

- Node.js 18+ with Express 5
- Prisma ORM (SQLite locally, Postgres/MySQL compatible in production)
- Redis or Upstash Redis REST for caching/short key storage
- JWT authentication and bcrypt password hashing

## Prerequisites

- Node.js 18+
- npm or pnpm (recommended)
- Redis instance (local, Docker, or Upstash)
- A database supported by Prisma (default `.env` uses SQLite)

## Environment

Create a `.env` next to `index.js` and provide at least:

```
PORT=4000
DATABASE_URL="file:./dev.db"         # SQLite by default – replace with postgres://... in prod
JWT_SECRET="super-secret"
JWT_EXPIRY="7d"
BCRYPT_ROUNDS=10
ENCRYPTION_KEY="32-char-hex-string"  # used for API key encryption

# Redis (choose one)
REDIS_URL=redis://localhost:6379
# or granular fields:
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=

# Upstash fallback (optional)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Short link + demo helpers
URL_SHORTENER_SERVICE_URL=https://redis-microservice.example.com
DEFAULT_DOMAIN=links.ziptie.dev
DEMO_FALLBACK_BASE_URL=https://links.ziptie.dev
DEMO_SHORT_TTL=3600
```

## Install & Run

```bash
pnpm install        # or npm install
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm dev            # nodemon
# or
pnpm start
```

The server listens on `PORT` (default `4000`) and mounts all API routes under `/api`.

## Key Endpoints

| Method & Path | Purpose |
| ------------- | ------- |
| `GET /api/health` | Simple liveness check |
| `POST /api/auth/register` / `POST /api/auth/login` | Email/password user flows with JWT responses |
| `GET /api/users/me` | Fetch profile for authenticated user |
| `POST /api/urls/shorten` | Create a short link directly against Redis |
| `POST /api/shortlink/resolve` | Resolve a key via the Redis microservice |
| `POST /api/keys` | Issue API keys for automation |
| `GET /api/demo/sample` | Create demo short URLs for marketing |

Review `src/routes/*.js` for the authoritative list.

## Development Notes

- `src/lib/prisma.js` handles the singleton Prisma client.
- `src/config/redis.js` automatically picks Upstash REST when tokens are provided.
- Short link creation lives in `src/services/shortlinkService.js` and proxies requests to the Redis microservice for multi-region deployments.
- Auth middleware lives in `src/middleware/`.

## Testing & Formatting

Formal tests are not yet set up. Consider using tools such as `supertest` or `vitest` for new features. ESLint/TSC are not configured for the backend, so run formatters manually if needed.
