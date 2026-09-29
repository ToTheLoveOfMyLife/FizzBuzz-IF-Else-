# Contributing to FieldOps

## Development workflow

1. Create a branch from `main`.
2. Keep the change focused.
3. Add or update tests when behavior changes.
4. Run the local checks.
5. Open a pull request with a short explanation of the change.
6. Merge after CI passes.

## Local checks

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

## Pull requests

Include:

- what changed
- database/schema impact, if any
- authorization/security impact, if any
- tests run
- screenshots for UI changes when useful

## Project rules

- Authorization is enforced on the server.
- Work-order status rules stay outside presentation code.
- External input is validated before persistence.
- Important operational changes are written to the audit log.
- Changes should leave tests and builds passing.
