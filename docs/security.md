# Security notes

FieldOps currently uses:

- bcrypt password hashing
- random opaque session tokens
- token hashes stored instead of raw session secrets
- HTTP-only session cookies
- SameSite cookie restrictions
- secure cookies in production
- database-backed session expiration
- server-side authorization on protected endpoints
- technician ownership checks
- schema validation on external input
- audit logging for privileged changes

See [SECURITY.md](../SECURITY.md) for the remaining security work required before using the application with real customer data.
