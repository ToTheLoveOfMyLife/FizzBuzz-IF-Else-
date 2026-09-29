# ADR 0001: Use opaque database-backed sessions

## Status

Accepted

## Context

FieldOps needs authenticated multi-user sessions. A portfolio project could use client-stored JWTs, but that would make revocation and server-side session lifecycle less explicit.

## Decision

FieldOps uses a cryptographically random opaque session token.

- The raw token is sent only in an HTTP-only cookie.
- Only a SHA-256 hash of the token is stored in PostgreSQL.
- Sessions have a database expiration time.
- Logout invalidates the server-side session.
- Production cookies are marked secure.

## Consequences

### Benefits

- server-controlled revocation
- no user claims are trusted from client storage
- session inventory can be inspected or invalidated
- raw tokens are not persisted in the database

### Costs

- every authenticated request requires a session lookup
- cleanup of expired sessions should eventually be automated
- horizontal scaling depends on shared database availability
