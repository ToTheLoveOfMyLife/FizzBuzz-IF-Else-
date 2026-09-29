# Security Policy

## Current controls

- bcrypt password hashing
- random opaque session tokens
- SHA-256 session-token hashes stored in the database
- HTTP-only session cookies
- SameSite cookie restrictions
- secure cookies in production
- database-backed session expiration
- server-side role authorization
- technician ownership checks
- request validation
- audit logging for privileged changes

## Before production use

The following would still need to be added or hardened before using FieldOps with real customer data:

- login rate limiting and lockout controls
- CSRF/origin protection for state-changing requests
- password reset and invitation flows
- secret rotation and centralized secret management
- dependency/security scanning
- security and audit monitoring
- hardened database and network policies
- end-to-end authorization tests

## Reporting

If you find a security issue, avoid posting sensitive exploit details publicly. Open a GitHub issue with a minimal description or contact the repository owner directly.
