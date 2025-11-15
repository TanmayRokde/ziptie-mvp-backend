# ziptie-mvp-backend ⚙️

> Developed by [TanmayRokde](https://github.com/TanmayRokde) & [pradnyaakumbhar](https://github.com/pradnyaakumbhar)

![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![Express](https://img.shields.io/badge/express-5.x-black)
![Prisma](https://img.shields.io/badge/prisma-ORM-blue)
![Redis](https://img.shields.io/badge/cache-redis-orange)
![Status](https://img.shields.io/badge/status-alpha-purple)



> **ZipTie Control Tower**  
> This service is the central nervous system for ZipTie: auth, users, API keys, and the orchestration layer that talks to Redis plus the microservice.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Environment Variables](#environment-variables)
5. [Setup & Installation](#setup--installation)
6. [Running Locally](#running-locally)
7. [API Surface](#api-surface)
8. [Data & Services](#data--services)
9. [Development Tips](#development-tips)
10. [Testing & Quality](#testing--quality)
11. [Deployment Notes](#deployment-notes)

---

## Architecture 🏗️

```
┌──────────┐    REST/JSON    ┌────────────────────┐
│ Frontend │ ──────────────► │ ziptie-mvp-backend │
└──────────┘                 └─────────┬──────────┘
                                        │
          ┌──────────────┬──────────────┼──────────────┐
          ▼              ▼              ▼              ▼
   Prisma ORM      Redis/Upstash   Redis microservice  3rd party APIs
   (SQLite dev)    (session/cache) (short key storage) (email, etc.)
```

- API routes mounted under `/api`.
- Redis microservice handles raw key/value persistence; this backend focuses on auth, domain logic, and orchestration.

## Tech Stack 🧰

- **Runtime:** Node.js 18+, Express 5
- **Database:** Prisma ORM (SQLite locally, Postgres/MySQL/PlanetScale compatible)
- **Cache:** Redis 5 TCP or Upstash REST
- **Auth:** JWT + bcrypt password hashing
- **Tooling:** pnpm/nodemon, Prisma migrations

## Prerequisites ✅

- Node.js 18 or newer
- pnpm (recommended) or npm
- Redis instance (Docker, local, or Upstash tokens)
- SQLite (bundled) or a managed SQL database for production

## Environment Variables 🔐

Create `.env` next to `index.js`:

```
PORT=4000
DATABASE_URL="file:./dev.db"          # Replace with postgres://... in prod
NODE_ENV=development

# Auth
JWT_SECRET="super-secret"
JWT_EXPIRY="7d"
BCRYPT_ROUNDS=10

# Encryption (for API keys)
ENCRYPTION_KEY="32-char-hex-string"

# Redis (choose one setup)
REDIS_URL=redis://localhost:6379
# or granular:
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=

# Upstash REST fallback
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Short link helpers
URL_SHORTENER_SERVICE_URL=https://redis-microservice.example.com
DEFAULT_DOMAIN=links.ziptie.dev
DEMO_FALLBACK_BASE_URL=https://links.ziptie.dev
DEMO_SHORT_TTL=3600
```

## Setup & Installation 🧱

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate dev --name init
```

If you are targeting Postgres/MySQL, update `DATABASE_URL` and run `pnpm prisma migrate deploy`.

## Running Locally 🏃‍♂️

```bash
pnpm dev      # nodemon index.js
# or
pnpm start    # node index.js
```

Server listens on `PORT` (default `4000`) and exposes REST endpoints under `/api`.

Use `curl http://localhost:4000/api/health` to verify startup.

## API Surface 🌐

| Method | Path | Description | Auth |
| ------ | ---- | ----------- | ---- |
| `GET` | `/api/health` | Liveness probe | None |
| `POST` | `/api/auth/register` | Create account (email/password) | None |
| `POST` | `/api/auth/login` | Issue JWT | None |
| `GET` | `/api/users/me` | Current user profile | Bearer token |
| `PATCH` | `/api/users/me` | Update profile metadata | Bearer token |
| `POST` | `/api/urls/shorten` | Create short link (direct Redis) | Bearer token |
| `POST` | `/api/shortlink/resolve` | Resolve via microservice | Bearer token or service key |
| `POST` | `/api/keys` | Generate API key | Bearer token |
| `GET` | `/api/keys` | List user API keys | Bearer token |
| `POST` | `/api/demo/sample` | Create marketing/demo links | None (rate-limit recommended) |

Check `src/routes/*.js` for the full matrix, including domain management routes.

## Data & Services 🧠

- **Prisma Client:** `src/lib/prisma.js` exports a singleton to avoid multiple connections in dev hot reload.
- **Redis Client:** `src/config/redis.js` decides between Upstash REST and native `redis@5`.
- **Short Links:** `src/services/shortlinkService.js` proxies to the Redis microservice (`URL_SHORTENER_SERVICE_URL`) for region-aware storage.
- **API Keys:** AES-style encryption handled in `src/utils/encryption.js`; generation logic in `src/utils/apiKeysGenerator.js`.
- **Auth Middleware:** `src/middleware/auth.js` + `authToken.js` decode JWTs and gate protected routes.

## Development Tips 💡

- Enable verbose logging by setting `DEBUG=ziptie:*` (if you add `debug` statements).
- Prisma Studio: run `pnpm prisma studio` to inspect your SQLite/Postgres tables.
- Seed scripts can live in `prisma/seed.js`; call via `pnpm prisma db seed`.

## Testing & Quality 🧪

Formal automated tests are not wired yet. Recommended next steps:

- Add unit tests with Vitest or Jest for services.
- Use `supertest` for integration coverage around `src/routes`.
- Consider ESLint + TypeScript for type safety (currently plain JS).

## Deployment Notes 🚀

- Production environments should set `NODE_ENV=production` to disable Prisma query logging and to prevent dev defaults (like SQLite) from leaking in.
- Ensure Redis/Upstash credentials are injected along with `URL_SHORTENER_SERVICE_URL`.
- The repo ships with `vercel.json` for serverless deployment, but it can also run on traditional Node servers or Docker. Remember to run `pnpm prisma migrate deploy` before starting the server in CI/CD.
