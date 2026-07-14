# Design Notes

**Participant:** Sahib Bajaj  

## Architecture

```
┌─────────────┐     HTTP/JSON      ┌─────────────┐     SQL      ┌──────────┐
│  React SPA  │ ◄──────────────► │ Express API │ ◄──────────► │  SQLite  │
│  (Vite)     │   /api/*         │  (Node.js)  │              │  file DB │
└─────────────┘                  └─────────────┘              └──────────┘
```

## Layering (Backend)

| Layer | Responsibility |
|-------|----------------|
| Routes | HTTP mapping, call validators |
| Validators | express-validator rules |
| Services | `statusMachine.js` — pure business rules |
| Repositories | SQL queries via `node:sqlite` (DatabaseSync) |
| DB | Migration + seed scripts |

## State Machine Design

Centralized in `statusMachine.js` with:
- `canTransition(from, to)` — boolean check
- `getAllowedTransitions(status)` — for API and UI
- `assertTransition(from, to)` — throws `StatusTransitionError` (422)

Routes never embed transition logic inline.

## API Error Contract

| Status | When |
|--------|------|
| 400 | Validation failure (`{ errors: [{ field, message }] }`) |
| 404 | Ticket not found |
| 422 | Invalid status transition (`{ error: "..." }`) |
| 500 | Unexpected server error |

## Frontend Design

- Three pages: List, Create, Detail
- Detail page separates field updates (PUT) from status changes (PATCH)
- Status buttons driven by `allowedTransitions` from API
- ErrorBanner component for API failures including 422

## Database Choice

SQLite chosen for zero-config local setup while meeting persistence requirement. File stored at `data/tickets.db` (configurable via `DATABASE_PATH`).

## Trade-offs

| Decision | Rationale |
|----------|-----------|
| No auth in Core | Per assessment; reduces scope |
| Default user id=1 | Simulates actor without auth UI |
| Monorepo folders | Clear separation; simple README setup |
| Integration tests only | Meets Core mandatory test tier |
