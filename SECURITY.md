# Security Policy

FieldOps is a portfolio application and is not presented as a security-certified production service.

## Security controls demonstrated

- bcrypt password hashing
- cryptographically random opaque session tokens
- SHA-256 session-token hashes stored in the database
- HTTP-only session cookies
- SameSite cookie restrictions
- secure cookies in production
- database-backed session expiration
- server-side role-based authorization
- technician ownership checks
- request-schema validation
- audit logging for privileged operational changes

## Production hardening still required

Before exposing FieldOps as a real production system, I would add:

- login rate limiting and lockout controls
- CSRF/origin hardening for state-changing requests
- password reset and invitation flows
- secret rotation and centralized secret management
- dependency/security scanning in the release process
- structured security/audit monitoring
- hardened database/network policies
- end-to-end authorization tests

## Reporting

If you find a security issue in this portfolio project, please avoid posting sensitive exploit details publicly. Open a GitHub issue with a minimal description or contact the repository owner directly.
