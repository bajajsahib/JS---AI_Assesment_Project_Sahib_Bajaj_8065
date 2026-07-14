# Prompt History — Support Ticket Management System

**Participant:** Sahib Bajaj  
**Project:** Support Ticket Management System (Core + Stretch)  
**Primary AI Tool:** Cursor  
**Stack:** React + Vite, Node.js + Express, SQLite (`node:sqlite`)  
**Assessment:** JS AI Capability Exercise  

This document is the **full prompt history** required for Part B submission. It shows how a developer would realistically use Cursor across the software development lifecycle — with context-setting, iteration, correction of AI mistakes, and traceability to code and tests.

---

## How to Read This Document

Each entry follows this pattern:

| Field | Description |
|-------|-------------|
| **Phase** | SDLC stage (requirement analysis, planning, coding, testing, etc.) |
| **Prompt** | Exact or near-exact text sent to Cursor |
| **Context** | Files/rules attached with `@` references |
| **AI Output** | What Cursor generated or suggested |
| **My Review** | What I accepted, changed, or rejected |
| **Result** | Files, features, or tests produced |

---

## Phase 1 — Requirement Analysis

### Prompt 1.1 — Exercise understanding & project selection

**Phase:** Requirement Analysis  
**Prompt:**
```
Please act as an architect and analyze @AI_Assesment_Project.pdf.
I am completing the JS AI Capability Exercise. Help me understand:
1. What is mandatory (Core) vs optional (Stretch)?
2. Which project option should I pick for a full-stack React + Node.js developer?
3. What artifacts must be in my repository for submission?
Do NOT start coding yet — give me a structured requirement breakdown first.
```

**Context:** `@AI_Assesment_Project.pdf`

**AI Output:**
- Identified three parts: Part A (tool-workflow.md), Part B (app), Part C (form + reflection)
- Recommended Support Ticket Management System
- Listed Core features, state machine rules, mandatory test tier, Cursor-specific artifacts

**My Review:**
- Confirmed Core scope only for first delivery; Stretch later
- Flagged state machine as the signature judgment piece — must be enforced in backend, not UI only
- Noted authentication is optional (not in Core)

**Result:** `docs/requirement-analysis.md`, decision to use Cursor with spec-driven workflow

---

### Prompt 1.2 — Entity and acceptance criteria extraction

**Phase:** Requirement Analysis  
**Prompt:**
```
From the PDF, extract a precise domain model and acceptance criteria for the
Support Ticket Management Core tier.

Include:
- All 3 entities with fields
- All 10 Core features as testable statements
- The status state machine with every valid and INVALID transition
- Map each acceptance criterion to a future API endpoint or UI screen

Output as structured markdown I can save as acceptance-criteria.md.
```

**Context:** `@AI_Assesment_Project.pdf`

**AI Output:**
- Entity definitions for User, Ticket, Comment
- 11 acceptance criteria (AC-1 to AC-11)
- State machine transition table

**My Review:**
- Corrected AI suggestion that allowed `Resolved → In Progress` — PDF does not allow backward transitions
- Added explicit INVALID transition matrix for integration tests
- Confirmed User is seeded-only (no user management UI in Core)

**Result:** `tool-specific/cursor-workflow/acceptance-criteria.md`, `tool-specific/cursor-workflow/spec.md`

---

## Phase 2 — Planning & Design

### Prompt 2.1 — Architecture and tech stack

**Phase:** Planning & Design  
**Prompt:**
```
Act as a senior full-stack architect. Based on @project-context.md and @spec.md,
propose a minimal but professional architecture for the Core tier:

- Frontend framework
- Backend framework
- Database choice (must persist across restarts, easy local setup)
- Folder structure
- API design conventions

Prefer simplicity for an 8–12 hour Core scope. Explain trade-offs.
Do not over-engineer — no auth, no Docker in Core.
```

**Context:** `@tool-specific/cursor-workflow/project-context.md`, `@tool-specific/cursor-workflow/spec.md`

**AI Output:**
- React + Vite frontend, Express backend, SQLite database
- Monorepo: `backend/`, `frontend/`, `docs/`, `prompts/`
- REST API under `/api`, layered backend (routes → services → repositories)

**My Review:**
- Accepted stack alignment with competency expectations (React, Node.js)
- Chose SQLite for zero-config persistence
- Requested separate `statusMachine.js` service — business rules must not live in routes

**Result:** `docs/design.md`, `tool-specific/cursor-workflow/project-context.md`

---

### Prompt 2.2 — Implementation task breakdown

**Phase:** Planning & Design  
**Prompt:**
```
Create a phased implementation plan (tasks.md) for the Support Ticket Management Core.
Order: database → backend API → state machine tests → frontend pages → docs.

Each task should be small, checkable, and traceable to acceptance criteria.
Include Cursor rules I should create for persistent context.
```

**Context:** `@tool-specific/cursor-workflow/spec.md`, `@tool-specific/cursor-workflow/acceptance-criteria.md`

**AI Output:**
- 5 phases with checkbox tasks
- Suggested `.cursor/rules/` for project standards, backend, and frontend

**My Review:**
- Added explicit task for state machine integration tests before frontend
- Added prompt history and reflection as final phase tasks

**Result:** `tool-specific/cursor-workflow/tasks.md`, `.cursor/rules/*.mdc`

---

### Prompt 2.3 — Cursor workflow configuration

**Phase:** Planning & Design  
**Prompt:**
```
I am using Cursor for this exercise. Create the tool-specific/cursor-workflow/ artifacts
required by the assessment PDF:
- project-context.md
- spec.md
- tasks.md
- acceptance-criteria.md
- cursor-rules-or-instructions.md

Also create .cursor/rules/ files that enforce:
- Status changes only through statusMachine.js
- No secrets in repo
- Proper HTTP status codes (400, 404, 422)
```

**Context:** `@AI_Assesment_Project.pdf` (Cursor tool-specific section)

**AI Output:**
- Full cursor-workflow folder structure
- Three rule files with `alwaysApply` and `globs` patterns

**My Review:**
- Verified rules match actual project conventions
- Ensured rules reference state machine module by name

**Result:** `tool-specific/cursor-workflow/`, `.cursor/rules/`

---

## Phase 3 — Backend Implementation

### Prompt 3.1 — Database schema and seed data

**Phase:** Code Generation  
**Prompt:**
```
Implement the database layer for the Support Ticket Management backend:

1. Migration script creating users, tickets, comments tables
2. Seed script with 4 users and 3 sample tickets with comments
3. Use SQLite — start with better-sqlite3

Follow the schema in @spec.md exactly.
Use ISO 8601 timestamps. Enable foreign keys.
```

**Context:** `@tool-specific/cursor-workflow/spec.md`, `@.cursor/rules/backend-api.mdc`

**AI Output:**
- `backend/src/db/migrate.js`, `seed.js`, `database.js`
- CHECK constraints on priority and status enums

**My Review:**
- Verified foreign keys and seed data references valid user IDs
- Accepted schema as-is

**Result:** `backend/src/db/migrate.js`, `backend/src/db/seed.js`

---

### Prompt 3.2 — Status state machine (signature Core feature)

**Phase:** Code Generation  
**Prompt:**
```
Implement the ticket status state machine in backend/src/services/statusMachine.js.

Rules from the PDF (strict — no exceptions):
  Open        → In Progress | Cancelled
  In Progress → Resolved    | Cancelled
  Resolved    → Closed
  Closed      → terminal (no transitions)
  Cancelled   → terminal (no transitions)

Export: canTransition(), getAllowedTransitions(), assertTransition()
assertTransition must throw a 422-ready error with a clear message listing allowed transitions.

Do NOT allow any backward transitions (e.g. Resolved → In Progress).
```

**Context:** `@tool-specific/cursor-workflow/acceptance-criteria.md`, `@AI_Assesment_Project.pdf`

**AI Output:**
- `statusMachine.js` with transition map and helper functions
- `StatusTransitionError` class with statusCode 422

**My Review:**
- Manually verified every edge in the transition table against PDF
- Rejected AI's initial suggestion to allow reopening closed tickets
- Confirmed terminal states return empty allowed transitions

**Result:** `backend/src/services/statusMachine.js`

---

### Prompt 3.3 — REST API routes

**Phase:** Code Generation  
**Prompt:**
```
Build the Express REST API for tickets following @spec.md:

- GET/POST /api/tickets
- GET/PUT /api/tickets/:id
- PATCH /api/tickets/:id/status  (state machine only — NOT via PUT)
- POST /api/tickets/:id/comments
- GET /api/users (for assignee dropdown)

Use express-validator for all inputs.
Return 400 for validation errors, 404 for not found, 422 for invalid status transitions.
Default createdBy to seeded user id=1 (no auth in Core).
```

**Context:** `@tool-specific/cursor-workflow/spec.md`, `@backend/src/services/statusMachine.js`, `@.cursor/rules/backend-api.mdc`

**AI Output:**
- Route files, validators, repositories
- Global error handler

**My Review:**
- Caught AI putting status update in PUT handler — moved to dedicated PATCH endpoint
- Verified assignee validation checks user exists in DB
- Confirmed search supports keyword in title/description

**Result:** `backend/src/routes/`, `backend/src/validators/`, `backend/src/repositories/`

---

## Phase 4 — Testing

### Prompt 4.1 — State machine integration tests (mandatory Core tier)

**Phase:** Testing  
**Prompt:**
```
Write Jest + Supertest integration tests that prove the state machine rules.
This is the mandatory Core test tier from the assessment PDF.

Test matrix:
- Every VALID transition succeeds (200)
- Every INVALID transition is rejected (422)
- Terminal states (Closed, Cancelled) cannot transition
- Test Open→Cancelled and In Progress→Cancelled paths

Use an isolated test database. Clean up after tests.
```

**Context:** `@tool-specific/cursor-workflow/acceptance-criteria.md`, `@backend/src/services/statusMachine.js`

**AI Output:**
- `backend/tests/stateMachine.test.js` with 10 test cases

**My Review:**
- Ran `npm test` — all passed
- Fixed Windows SQLite file lock issue in `afterAll` by calling `closeDatabase()`

**Result:** `backend/tests/stateMachine.test.js` — 10/10 passing

---

### Prompt 4.2 — Full API integration tests

**Phase:** Testing  
**Prompt:**
```
The app is partially working. Write comprehensive API integration tests covering:
health, users, stats, paginated list, filters (status, priority, assignee),
search, create, detail, update, comment, status transition, validation rejection.

Use Supertest against the Express app with isolated test DB.
```

**Context:** `@backend/src/routes/tickets.js`, `@backend/src/repositories/ticketRepository.js`

**AI Output:**
- `backend/tests/api.test.js` with 13 test cases

**My Review:**
- All 23 tests pass (10 state machine + 13 API)
- Tests became regression suite after UI redesign

**Result:** `backend/tests/api.test.js` — 23/23 total tests passing

---

## Phase 5 — Frontend Implementation (Core)

### Prompt 5.1 — React app scaffold and API client

**Phase:** Code Generation  
**Prompt:**
```
Create the React + Vite frontend for the Support Ticket Management Core:

Pages: Ticket List (search + status filter), Create Ticket, Ticket Detail
Components: StatusBadge, error handling
API client with proper error parsing for 400, 422, and network failures

Use React Router. Proxy /api to localhost:3001 in vite.config.js.
Show meaningful error messages when backend is not running.
```

**Context:** `@tool-specific/cursor-workflow/spec.md`, `@.cursor/rules/frontend-react.mdc`

**AI Output:**
- Vite + React scaffold, pages, API client, basic CSS

**My Review:**
- Improved error message to say "start the backend" instead of generic "Request failed"
- Verified proxy config works for local dev

**Result:** `frontend/src/pages/`, `frontend/src/api/client.js`

---

### Prompt 5.2 — Ticket detail with state machine UI

**Phase:** Code Generation  
**Prompt:**
```
Build the Ticket Detail page so that:
1. Status transition buttons show ONLY allowed next states from API (allowedTransitions)
2. Invalid transitions from API (422) show a clear error in the UI
3. Comments display as a chronological list
4. Ticket fields (title, description, priority, assignee) are editable separately from status

Follow @acceptance-criteria.md AC-4, AC-5, AC-6.
```

**Context:** `@tool-specific/cursor-workflow/acceptance-criteria.md`, `@frontend/src/api/client.js`

**AI Output:**
- TicketDetail page with edit form, status buttons, comment form

**My Review:**
- Tested invalid transition manually — 422 error displays correctly
- Later refined to separate Edit/Cancel/Save buttons (Phase 8)

**Result:** `frontend/src/pages/TicketDetail.jsx`

---

## Phase 6 — Debugging & Fixes

### Prompt 6.1 — SQLite native module version error

**Phase:** Debugging  
**Prompt:**
```
npm test fails with:
  better_sqlite3.node was compiled against NODE_MODULE_VERSION 127
  but Node.js requires NODE_MODULE_VERSION 137

Fix this so tests and server run on Node 24 without native rebuild issues.
```

**Context:** Error output from terminal, `@backend/src/db/database.js`

**AI Output:**
- Replaced `better-sqlite3` with Node built-in `node:sqlite` (DatabaseSync)
- Updated package.json engines to `>=22.5.0`

**My Review:**
- Ran `npm test` — all 10 tests passed after change
- No more native module dependency — works across Node versions

**Result:** `backend/src/db/database.js` updated, `better-sqlite3` removed

---

### Prompt 6.2 — "Request failed" in UI

**Phase:** Debugging  
**Prompt:**
```
The UI shows "Request failed" on the ticket list page. Backend may not be running
or the frontend can't reach the API. Diagnose and fix.

Screenshot shows empty list with red error banner.
```

**Context:** Screenshot, `@frontend/src/api/client.js`, `@frontend/vite.config.js`

**AI Output:**
- Identified backend not running on port 3001
- Improved API client error messages
- Provided two-terminal startup instructions

**My Review:**
- Confirmed fix: start backend first, then frontend
- Added `apiFetch` wrapper with network error detection

**Result:** `frontend/src/api/client.js` improved, README troubleshooting added

---

### Prompt 6.3 — Partially working after UI redesign

**Phase:** Debugging  
**Prompt:**
```
partially working, please test full application
```

**Context:** Running app, `@backend/src/routes/tickets.js`, `@frontend/src/api/client.js`

**AI Output:**
- Found old backend still running on port 3001 with outdated API
- New UI expected `{ tickets, total, page }` but old API returned plain array
- `/api/tickets/stats` returned 400 on old server

**My Review:**
- Killed stale process on port 3001
- Restarted backend with new code
- Added `normalizeTicketList()` for response compatibility
- All 13 live API tests passed after restart

**Result:** Root `package.json` scripts, README troubleshooting, `normalizeTicketList()` in API client

---

## Phase 7 — Stretch / Professional UI Enhancement

### Prompt 7.1 — Atlassian-style professional redesign

**Phase:** Code Generation (Stretch)  
**Prompt:**
```
Make this like Atlassian or a similar platform — professional and polished.
Add necessary features, day/night mode, fix all issues.
Make it a proper efficient professional tool.

Include Stretch features from the PDF where reasonable:
- Filter by priority and assignee
- Sorting and pagination
- Dashboard with stats
```

**Context:** `@tool-specific/cursor-workflow/spec.md`, `@frontend/src/`

**AI Output:**
- Full UI redesign: sidebar, header, dashboard, kanban board
- Dark/light theme with localStorage persistence
- Toast notifications, loading states, empty states
- Backend: stats endpoint, pagination, priority/assignee filters, sorting

**My Review:**
- Accepted Atlassian-inspired color scheme and layout
- Verified all Core features still work after redesign
- Theme toggle tested in both modes

**Result:** Professional UI, `GET /api/tickets/stats`, Stretch filters/pagination

---

## Phase 8 — Code Review & Refinement

### Prompt 8.1 — Review state machine is not bypassed

**Phase:** Code Review  
**Prompt:**
```
Review all backend route handlers and confirm:
1. No route updates ticket status except PATCH /api/tickets/:id/status
2. All status changes go through statusMachine.js
3. PUT /api/tickets/:id cannot change status field
4. Frontend never shows invalid transition buttons

Point to any violations and fix them.
```

**Context:** `@backend/src/routes/tickets.js`, `@backend/src/services/statusMachine.js`, `@frontend/src/pages/TicketDetail.jsx`

**AI Output:**
- Confirmed clean separation; no violations found
- Suggested Edit/Cancel/Save button improvement on detail page

**My Review:**
- Accepted button UX fix
- Re-ran state machine tests to confirm no regression

**Result:** Ticket detail edit flow improved, 23/23 tests still passing

---

### Prompt 8.2 — Submission artifacts check

**Phase:** Documentation  
**Prompt:**
```
Review my repository against the assessment PDF "What Counts as Complete" checklist.
List anything missing for submission and create it.

Required: prompt history, tool-workflow.md, reflection, PR description,
requirement analysis, design notes, Cursor workflow artifacts.
```

**Context:** `@AI_Assesment_Project.pdf`, repository structure

**AI Output:**
- Checklist review
- Identified prompt history needed expansion for submission

**My Review:**
- This document (`prompt-history.md`) created as full submission artifact
- All other artifacts confirmed present

**Result:** Complete submission-ready repository

---

## Phase 9 — Prompt History for Submission

### Prompt 9.1 — Final prompt history document

**Phase:** Documentation  
**Prompt:**
```
I need to submit this as a task with all prompt history.
Analyze @AI_Assesment_Project.pdf and create specific prompt history for making
this tool in the required pattern — the pattern a human would use when building
this tool with AI across the full lifecycle.
```

**Context:** `@AI_Assesment_Project.pdf`, `@prompts/prompt-history.md`

**AI Output:** This document.

**Result:** Submission-ready prompt history with lifecycle mapping and traceability.

---

## Iteration Log — AI Mistakes Caught & Corrected

| # | What AI suggested | Why wrong | What I did |
|---|-------------------|-----------|------------|
| 1 | `Resolved → In Progress` transition | PDF forbids backward transitions | Removed from state machine |
| 2 | Status update via PUT /tickets/:id | Violates separation of concerns | Dedicated PATCH /status endpoint |
| 3 | `better-sqlite3` for SQLite | Native module breaks on Node version upgrade | Switched to `node:sqlite` |
| 4 | Plain array API response after redesign | Frontend expected paginated object | Added `normalizeTicketList()` + restarted server |
| 5 | `/stats` route conflict | Old server matched "stats" as ticket ID | Route order fixed; server restart required |
| 6 | Single Edit/Save button on detail | Poor UX — no cancel | Split into Edit / Cancel / Save |

---

## Traceability Matrix

| Acceptance Criterion | Prompt(s) | Key File(s) | Test |
|---------------------|-----------|-------------|------|
| AC-1 Create ticket via UI | 5.1, 5.2 | `CreateTicket.jsx`, POST `/api/tickets` | api.test.js |
| AC-2 List all tickets | 3.3, 5.1 | `TicketList.jsx`, GET `/api/tickets` | api.test.js |
| AC-3 Ticket detail view | 5.2 | `TicketDetail.jsx`, GET `/api/tickets/:id` | api.test.js |
| AC-4 Update fields & reassign | 3.3, 5.2 | PUT `/api/tickets/:id` | api.test.js |
| AC-5 Add comments | 3.3, 5.2 | POST `/api/tickets/:id/comments` | api.test.js |
| AC-6 State machine enforced | 3.2, 3.3, 5.2 | `statusMachine.js`, PATCH `/status` | stateMachine.test.js |
| AC-7 Search & status filter | 3.3, 5.1, 7.1 | `ticketRepository.js`, `TicketList.jsx` | api.test.js |
| AC-8 Data persists restart | 3.1 | `migrate.js`, SQLite file | Manual |
| AC-9 Backend validation | 3.3 | `ticketValidators.js` | api.test.js |
| AC-10 No secrets in repo | 2.3 | `.env.example`, `.gitignore` | Manual |
| AC-11 State machine tests pass | 4.1 | `stateMachine.test.js` | 10/10 pass |

---

## Information NOT Shared With AI

- Production credentials, API keys, or tokens
- Real customer or employee PII
- Internal company URLs or proprietary code from other projects
- Unrelated employer codebase

---

## Prompt Count Summary

| Lifecycle Phase | Prompts | Key Outcome |
|----------------|---------|-------------|
| Requirement Analysis | 2 | Domain model, acceptance criteria |
| Planning & Design | 3 | Architecture, tasks, Cursor rules |
| Backend Implementation | 3 | DB, state machine, REST API |
| Testing | 2 | 23 automated tests |
| Frontend (Core) | 2 | React app, ticket detail |
| Debugging | 3 | SQLite fix, API connection, stale server |
| Stretch / UI | 1 | Professional Atlassian-style UI |
| Code Review | 2 | State machine audit, submission check |
| Documentation | 1 | This prompt history |
| **Total** | **19** | Full working application + artifacts |

---

*This prompt history demonstrates spec-driven, iterative AI-assisted development with Cursor — not one-shot code generation. Each phase builds on the previous with validation, testing, and human review.*

