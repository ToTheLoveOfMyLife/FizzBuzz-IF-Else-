# FieldOps

![CI](https://github.com/timwmcqueen/FieldOps/actions/workflows/ci.yml/badge.svg)

FieldOps is a work-order app for managing service jobs. Dispatchers can create work orders, assign technicians, set priority and scheduling, and follow a job from open to complete. The app also keeps an audit trail of important changes.

## Stack

- Next.js 16
- React 19
- TypeScript
- PostgreSQL
- Prisma
- bcryptjs
- Zod
- Vitest
- Docker / Docker Compose
- GitHub Actions

## Roles

### Admin
Full access to the application.

### Dispatcher
Can create customers and work orders, assign technicians, change queue status, and view audit activity.

### Technician
Only sees assigned work and can update the status of those work orders.

Permissions are checked on the server as well as in the UI.

## Features

- Password authentication with bcrypt
- Database-backed sessions
- HTTP-only, SameSite session cookies
- Admin, Dispatcher, and Technician roles
- Customer records
- Work-order creation and assignment
- Priority and scheduling
- Server-side status transition rules
- Technician ownership checks
- Dashboard metrics
- Audit history
- PostgreSQL persistence
- Seed data for local development
- Responsive UI
- Automated tests
- Docker / Docker Compose
- GitHub Actions CI

## Work-order lifecycle

```
OPEN
 ├──> ASSIGNED ──> IN_PROGRESS ──> COMPLETED
 │         │             │
 │         └──> BLOCKED ─┘
 │
 └──> CANCELLED
```

The transition rules are defined in `src/domain/work-order.ts` and enforced by the API.

## Local setup

Requirements:

- Node.js 22+
- Docker, or an existing PostgreSQL instance

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Create the environment file:

```bash
cp .env.example .env
```

Install dependencies, initialize the database, seed sample data, and start the app:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Demo accounts

These accounts are created by the seed script.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@fieldops.local` | `DemoAdmin123!` |
| Dispatcher | `dispatcher@fieldops.local` | `DemoDispatch123!` |
| Technician | `tech@fieldops.local` | `DemoTech123!` |

## Test

```bash
npm test
```

## Production build

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t fieldops .
docker run -p 3000:3000 --env-file .env fieldops
```

A PostgreSQL database must be reachable through `DATABASE_URL`.

## Documentation

- [Architecture](docs/architecture.md)
- [Security notes](docs/security.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [ADR 0001 — database-backed session authentication](docs/adr/0001-session-authentication.md)
- [ADR 0002 — API-boundary role authorization](docs/adr/0002-role-authorization.md)

## CI

Pull requests and pushes to `main` run:

1. dependency installation
2. Prisma schema setup against PostgreSQL
3. tests
4. a production Next.js build
