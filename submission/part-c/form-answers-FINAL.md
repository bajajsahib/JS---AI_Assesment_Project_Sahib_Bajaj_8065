# Competency Form — Final Answers

**Participant:** Sahib Bajaj  
**Project:** Support Ticket Management System  
**Primary AI Tool:** Cursor  
**Stack:** React + Vite, Node.js + Express, SQLite  

---

## 1. Requirement Understanding

I built the **Support Ticket Management System** from the JS AI Capability Exercise PDF. The goal is a small internal app where users can create support tickets, update them, add comments, search and filter tickets, and move them through a defined lifecycle.

Before writing any code, I broke the PDF into **Core** (mandatory) and **Stretch** (optional). For Core, I focused on three entities — User (seeded only), Ticket, and Comment — and ten functional features. The most important business rule is the **status state machine**:

- Open → In Progress or Cancelled  
- In Progress → Resolved or Cancelled  
- Resolved → Closed  
- Closed and Cancelled are terminal states  

The backend must reject any invalid transition with **HTTP 422**, and the UI must show a clear error. Authentication and user-management UI were intentionally out of scope for Core.

I documented all 11 acceptance criteria in `tool-specific/cursor-workflow/acceptance-criteria.md` and mapped each one to an API endpoint or UI screen before implementation. My requirement analysis is in `docs/requirement-analysis.md`.

---

## 2. How I Used AI Across the Lifecycle

I used **Cursor** as my primary AI tool throughout the project — not as a copy-paste code generator, but as a spec-driven pair programmer.

**Requirement analysis:** I attached the assessment PDF and asked Cursor to extract Core vs Stretch scope, entities, and acceptance criteria before any code was written. See `prompts/prompt-history.md`, Phase 1.

**Planning and design:** I created persistent context files — `spec.md`, `tasks.md`, `project-context.md` — and `.cursor/rules/` so every Cursor session followed the same conventions. I referenced these with `@` in prompts.

**Implementation:** I built backend first (database migration → state machine → REST API), then frontend. For each feature I pointed Cursor at `@spec.md` and `@acceptance-criteria.md` so generated code matched requirements.

**Testing:** I asked Cursor to write Jest + Supertest integration tests for the state machine. I ran `npm test` myself, reviewed failures, and fixed issues — for example closing the database properly on Windows so test files could be deleted.

**Debugging:** When I hit real errors (SQLite native module on Node 24, UI "Request failed", stale backend after redesign), I pasted the exact error output into Cursor and worked through root cause and fix with it.

**Code review:** I asked Cursor to review whether status could be changed outside `statusMachine.js` or the dedicated PATCH endpoint. I rejected suggestions that didn't match the PDF.

**Documentation:** I maintained prompt history, reflection, design notes, and a submission package as I went — not at the end.

Full prompt log: `prompts/prompt-history.md` (19 prompts across 9 phases).

---

## 3. Key Code and Design Decisions

**Tech stack:** I chose React + Vite for the frontend and Node.js + Express for the backend, with SQLite for persistence. This matches the competency stack and keeps local setup simple — `npm run setup` creates the database and seed data.

**State machine in its own module:** All transition logic lives in `backend/src/services/statusMachine.js`. Routes call `assertTransition()` — they never embed transition rules inline. This was the most important design decision because the state machine is the signature judgment piece of Core.

**Separate status endpoint:** Ticket field updates use `PUT /api/tickets/:id`. Status changes use `PATCH /api/tickets/:id/status` only. Cursor initially suggested updating status through PUT; I rejected that because it bypasses the state machine.

**`allowedTransitions` in API response:** The detail endpoint returns which status changes are valid. The UI only renders those buttons, so users rarely hit a 422 unless something is wrong.

**SQLite via `node:sqlite`:** I started with `better-sqlite3` but it broke on Node 24 due to native module version mismatch. I switched to Node's built-in `node:sqlite` — no native rebuild issues.

**Stretch UI:** I later added an Atlassian-style layout — dashboard, kanban board, dark/light mode, filters by priority and assignee, sorting, and pagination. Core features still work underneath.

Key files: `backend/src/services/statusMachine.js`, `backend/src/routes/tickets.js`, `docs/design.md`.

---

## 4. Testing Approach

Core requires integration tests that prove state machine rules. I have **23 automated tests**, all passing:

**State machine tests (10)** — `backend/tests/stateMachine.test.js`  
- Valid transitions succeed (Open → In Progress → Resolved → Closed, plus cancel paths)  
- Invalid transitions return 422 (e.g. Open → Resolved, Closed → anything)  
- Terminal states cannot transition  

**Full API tests (13)** — `backend/tests/api.test.js`  
- Health, users, stats, paginated list, filters, search, create, detail, update, comment, status change, validation rejection  

I use Jest + Supertest with an **isolated test database** so tests don't affect dev data. Run with `npm test` from the project root.

I also manually verified: create ticket in UI, invalid status shows error toast, restart backend — data still there in SQLite file.

---

## 5. Debugging Approach

I debugged three real issues during this project:

**SQLite / Node 24:** Tests failed with `NODE_MODULE_VERSION` mismatch on `better-sqlite3`. I pasted the full error into Cursor, understood it was a native binary compiled for a different Node version, and migrated to `node:sqlite` in `backend/src/db/database.js`. Re-ran tests — all passed.

**UI "Request failed":** The ticket list showed an error and no data. I checked `http://localhost:3001/api/health` — backend wasn't running. I learned both servers must run (backend first, then frontend). I also improved the error message in `frontend/src/api/client.js` so it tells the user to start the backend.

**Partially working after UI redesign:** Dashboard and stats were empty. An old backend process was still on port 3001 with the outdated API (returning a plain array instead of `{ tickets, total }`). I killed the stale process with `netstat` + `taskkill`, restarted the backend, and added `normalizeTicketList()` in the API client for safety.

For each issue I: reproduced the symptom → checked API directly → identified root cause → fixed → re-ran tests.

---

## 6. AI Mistake I Caught and Fixed

**Mistake:** Cursor suggested allowing `Resolved → In Progress` as a valid status transition.

**Why it was wrong:** The assessment PDF defines a strict forward-only lifecycle. Resolved can only go to Closed. Allowing rollback would violate AC-6 and the state machine test matrix.

**What I did:** I reviewed the transition table against the PDF myself, removed the backward edge, and kept only:
```
Open        → In Progress | Cancelled
In Progress → Resolved    | Cancelled
Resolved    → Closed
```

**Where in the repo:**
- Fix: `backend/src/services/statusMachine.js`
- Tests proving it: `backend/tests/stateMachine.test.js` (e.g. "In Progress → Open is rejected", "Resolved → In Progress is rejected")
- Documented in: `prompts/prompt-history.md` → Iteration Log, entry #1

**Second mistake:** Cursor put status updates in the general PUT handler. I moved status changes to `PATCH /api/tickets/:id/status` only — see `backend/src/routes/tickets.js`.

**Third mistake:** `better-sqlite3` on Node 24. Fixed in `backend/src/db/database.js` by switching to `node:sqlite`.

*(Add your Git commit hash here after you push — e.g. `git log --oneline backend/src/services/statusMachine.js`)*

---

## 7. What I Would Improve Next

Core is complete and tested. If I continued, I would add:

1. **Authentication** — JWT login, protected routes, role-based access on status changes  
2. **OpenAPI / Swagger** — API documentation for other developers  
3. **Docker Compose** — single command to start backend, frontend, and database  
4. **Unit tests** for `statusMachine.js` pure functions (in addition to integration tests)  
5. **CI pipeline** — run `npm test` on every push  

I implemented some Stretch items (dashboard, board view, priority/assignee filters, pagination, dark mode) but did not add auth, Docker, or Swagger yet. I am honest about that gap.

---

## 8. Repository Pointers

| What | Where |
|------|-------|
| Part A — AI workflow | `tool-workflow.md` |
| Full prompt history | `prompts/prompt-history.md` |
| All submission docs (one file) | `submission/Sahib-Bajaj-Complete-Submission.md` |
| Requirement analysis | `docs/requirement-analysis.md` |
| Design notes | `docs/design.md` |
| Reflection | `docs/reflection.md` |
| Cursor specs & rules | `tool-specific/cursor-workflow/`, `.cursor/rules/` |
| State machine code | `backend/src/services/statusMachine.js` |
| State machine tests | `backend/tests/stateMachine.test.js` |
| Full API tests | `backend/tests/api.test.js` |
| Setup instructions | `README.md` |

**Run locally:**
```bash
npm run setup
npm test
npm run backend    # Terminal 1
npm run frontend     # Terminal 2 → http://localhost:5173
```

---

## 9. Reflection (Part C)

**What went well:** Spec-driven development kept the state machine correct. Cursor rules gave consistent conventions across sessions. Integration tests gave me confidence in the hardest Core requirement.

**What was challenging:** Test database isolation on Windows, making sure the UI only shows valid status buttons, and debugging the stale backend process after the UI redesign.

**Ownership:** I can explain every layer — schema, seed data, transition rules, validation middleware, API error codes, and how the UI handles 422 responses. The state machine module is the single source of truth; I did not blindly accept AI output for that piece.

---

**Submitted by:** Sahib Bajaj  
**Project option:** Support Ticket Management System (Core + partial Stretch)  
**AI tool:** Cursor  
