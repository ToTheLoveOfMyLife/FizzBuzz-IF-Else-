# Contributing to FieldOps

FieldOps is primarily a portfolio project, but changes follow the same workflow I would use on a team.

## Development workflow

1. Create a focused branch from `main`.
2. Keep each change scoped to one concern.
3. Add or update tests for changed domain behavior.
4. Run the local quality gates before opening a pull request.
5. Open a pull request that explains the problem, the approach, and any tradeoffs.
6. Merge only after CI passes.

## Local quality gates

```bash
npm install
npm test
npm run build
```

For database-backed development:

```bash
docker compose up -d postgres
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

## Pull-request expectations

A useful pull request should include:

- a concise problem statement
- implementation notes
- database/schema impact, if any
- authorization/security impact, if any
- tests performed
- screenshots for user-interface changes when practical

## Engineering principles

- Authorization belongs on the server, not only in the UI.
- Domain-state rules should live outside presentation code.
- External input should be validated before persistence.
- Operationally important changes should be auditable.
- Changes should leave the project buildable and testable.
