# ADR 0002: Enforce role authorization at API boundaries

## Status

Accepted

## Context

FieldOps has Admin, Dispatcher, and Technician roles. Hiding controls in the interface is insufficient because a user can call HTTP endpoints directly.

## Decision

Every protected route resolves the authenticated user server-side and checks role/ownership before performing a mutation.

Technicians may only access their assigned work and may only update permitted workflow state. Dispatchers and administrators may create and assign work orders and see audit information.

## Consequences

### Benefits

- authorization cannot be bypassed by manipulating the UI
- role rules are explicit and testable
- API behavior remains correct regardless of client implementation

### Costs

- authorization checks must be kept consistent across route handlers
- a larger system would likely centralize policy evaluation further
