# Requirement Analysis

**Participant:** Sahib Bajaj  

## Source

JS AI Capability Exercise — Support Ticket Management System (Core tier).

## Problem Statement

Internal users need a lightweight application to manage support tickets: create, list, search/filter, view details, update fields, add comments, and progress tickets through a strict lifecycle.

## Scope (Core)

| In Scope | Out of Scope (Stretch) |
|----------|------------------------|
| CRUD for tickets (no user CRUD UI) | Authentication / JWT |
| Comments on tickets | Pagination, sorting |
| Keyword search + status filter | Priority/assignee filters |
| State machine enforcement | Swagger, Docker, CI |
| Seeded users | User management UI |
| Integration tests for state machine | Unit test suite |

## Key Business Rule

The **status state machine** is the signature judgment piece:

```
Open        → In Progress, Cancelled
In Progress → Resolved, Cancelled
Resolved    → Closed
Closed      → (terminal)
Cancelled   → (terminal)
```

Backend must reject invalid transitions (422). Frontend must show only allowed next states.

## Entities

1. **User** — seeded; used as creator/assignee references
2. **Ticket** — primary aggregate
3. **Comment** — child of ticket

## Acceptance Mapping

All 11 Core acceptance criteria from the PDF are mapped in `tool-specific/cursor-workflow/acceptance-criteria.md`.
