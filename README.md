# FieldOps

A multi-user **work-order operations platform** built as a flagship software-engineering portfolio project.

FieldOps goes beyond a simple CRUD demo: it includes authentication, database-backed sessions, role-based authorization, PostgreSQL persistence, server-enforced workflow rules, audit history, automated tests, CI, and containerized deployment configuration.

## Why this project

Many internal business systems have the same engineering challenges: multiple user roles, sensitive state changes, operational workflows, accountability, and durable data. FieldOps models those concerns around service work orders.

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
Full operational access.

### Dispatcher
Can create work orders, assign technicians, manage queue state, create customers, and review audit activity.

### Technician
Only sees assigned work and can update its workflow status. Technician permissions are enforced by server routes, not only by the interface.

## Features

- Password authentication with bcrypt
- Opaque database-backed session tokens
- HTTP-only, SameSite session cookies
- Server-side role-based authorization
- Multi-user work-order queue
- Customer records
- Technician assignment
- Work-order scheduling and priorities
- Server-enforced status transition rules
- Technician ownership checks
- Operational dashboard metrics
- Audit history for privileged changes
- Seeded demo users and realistic sample data
- Responsive UI
- PostgreSQL data model with indexes and foreign keys
- Automated unit/schema tests
- PostgreSQL-backed CI build validation
- Docker and local Docker Compose environment
- Architecture and security documentation

## Work-order lifecycle

```
OPEN
 ├──> ASSIGNED ──> IN_PROGRESS ──> COMPLETED
 │         │             │
 │         └──> BLOCKED ─┘
 │
 └──> CANCELLED
```

The transition rules live in a framework-independent domain module and are also enforced by the API.

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

Install, initialize, and seed:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Demo accounts

These credentials are only created by the local seed script.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@fieldops.local` | `DemoAdmin123!` |
| Dispatcher | `dispatcher@fieldops.local` | `DemoDispatch123!` |
| Technician | `tech@fieldops.local` | `DemoTech123!` |

Using different roles is part of the demo: the application returns different data and permits different actions based on the authenticated user.

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

A PostgreSQL database still needs to be reachable through `DATABASE_URL`.

## Engineering documentation

- [Architecture](docs/architecture.md)
- [Security notes](docs/security.md)

## CI

Every pull request runs against a real PostgreSQL service in GitHub Actions:

1. install dependencies
2. generate/apply the Prisma schema
3. run the test suite
4. execute a production Next.js build

Changes are not merged until those checks pass.

## What this project demonstrates

- full-stack TypeScript development
- authentication and server-managed sessions
- RBAC / authorization boundaries
- relational database modeling
- REST-style API design
- domain-state modeling
- audit logging
- validation and error handling
- testing and CI
- Docker-based local/production workflows
- explicit architecture and security tradeoffs

## Portfolio history

This repository originally contained a small FizzBuzz Java exercise. That source is preserved under `legacy/` to document progression from introductory programming into full-stack application engineering.
