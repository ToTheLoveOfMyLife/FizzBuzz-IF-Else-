# Security notes

FieldOps demonstrates several concrete security controls:

- bcrypt password hashing
- random opaque session tokens
- token hashes stored instead of raw session secrets
- HTTP-only session cookies
- SameSite cookie restrictions
- secure cookies in production
- database-backed session expiration
- server-side authorization on protected endpoints
- technician ownership checks on work-order mutations
- schema validation on external input
- audit logging for privileged operational changes

## Scope

FieldOps is a portfolio application, not a security-certified production service. The architecture document lists controls that would be required before exposing it as a real customer-facing system.
