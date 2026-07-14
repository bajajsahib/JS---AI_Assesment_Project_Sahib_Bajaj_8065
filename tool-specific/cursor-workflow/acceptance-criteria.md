# Acceptance Criteria — Core

Mapped from the assessment PDF. Each item is traceable to code and tests.

| # | Criterion | Verification |
|---|-----------|--------------|
| AC-1 | User can create a ticket via the UI | `frontend/src/pages/CreateTicket.jsx`, POST `/api/tickets` |
| AC-2 | User can view all tickets from the database | `TicketList.jsx`, GET `/api/tickets` |
| AC-3 | User can open ticket detail view | `TicketDetail.jsx`, GET `/api/tickets/:id` |
| AC-4 | User can update ticket fields and reassign | `TicketDetail.jsx`, PUT `/api/tickets/:id` |
| AC-5 | User can add comments | `TicketDetail.jsx`, POST `/api/tickets/:id/comments` |
| AC-6 | Status changes only through valid transitions | `statusMachine.js`, PATCH status route, UI transition buttons |
| AC-7 | Keyword search and status filter work | List API query params + `TicketList.jsx` filters |
| AC-8 | Data remains available after restart | SQLite file at `DATABASE_PATH` |
| AC-9 | Backend validation prevents invalid records | `validators/*.js`, 400 responses |
| AC-10 | No secrets committed | `.env.example` only; `.env` in `.gitignore` |
| AC-11 | State-machine integration tests pass | `backend/tests/stateMachine.test.js` |

## State Machine Test Matrix

| From | To | Expected |
|------|-----|----------|
| Open | In Progress | 200 OK |
| Open | Cancelled | 200 OK |
| Open | Resolved | 422 Rejected |
| In Progress | Resolved | 200 OK |
| In Progress | Cancelled | 200 OK |
| In Progress | Open | 422 Rejected |
| Resolved | Closed | 200 OK |
| Resolved | In Progress | 422 Rejected |
| Closed | * | 422 Rejected |
| Cancelled | * | 422 Rejected |
