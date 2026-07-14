# Participation Form — Answer Prep (Sahib Bajaj)

**Purpose:** Help you answer the competency form **in your own words** — specific, honest, and tied to real files in your repo.  
**Do not copy-paste blindly.** Read each answer, understand it, then rewrite naturally before submitting.

---

## ⚠️ Action Required Before You Submit

Your project is **not yet a Git repository**. The form asks you to point to **commits** (e.g. where you fixed an AI mistake). You must:

```powershell
cd support-ticket-management
git init
git add .
git commit -m "Initial commit: Support Ticket Management Core application"
```

Then make **separate commits** for key fixes (see [Suggested Commit Structure](#suggested-commit-structure) below) so you have real commit hashes to reference.

---

## How to Use This Document

| Form topic | Section below |
|------------|---------------|
| Requirement understanding | Q1 |
| AI across the lifecycle | Q2 |
| Key design decisions | Q3 |
| Testing approach | Q4 |
| Debugging approach | Q5 |
| AI mistake you caught | Q6 |
| What you'd improve | Q7 |
| Repo pointers | Q8 |

---

## Q1 — What did you understand about the requirements?

**Draft answer (rewrite in your words):**

I chose the **Support Ticket Management System (Core)** from the assessment PDF. The app lets internal users create support tickets, update them, add comments, search/filter, and move tickets through a **strict status lifecycle**.

The hardest Core requirement is the **state machine** — tickets can only move:
- Open → In Progress or Cancelled
- In Progress → Resolved or Cancelled
- Resolved → Closed

Invalid transitions must be **rejected by the backend (HTTP 422)** and shown clearly in the UI. Authentication and user management UI were out of Core scope.

I mapped all 11 acceptance criteria to code and tests in `tool-specific/cursor-workflow/acceptance-criteria.md` before building features.

**Repo pointers:**
- `docs/requirement-analysis.md`
- `tool-specific/cursor-workflow/acceptance-criteria.md`
- `tool-specific/cursor-workflow/spec.md`

---

## Q2 — How did you use AI across the lifecycle?

**Draft answer:**

I used **Cursor** spec-driven, not as a one-shot code generator.

1. **Requirement analysis** — I attached the PDF and asked for Core vs Stretch breakdown before any code (`prompts/prompt-history.md`, Phase 1).
2. **Planning** — I created `spec.md`, `tasks.md`, and `.cursor/rules/` so every session had persistent context.
3. **Implementation** — Backend first (DB → state machine → API), then frontend. I used `@spec.md` and `@acceptance-criteria.md` in prompts.
4. **Testing** — I asked Cursor to generate integration tests for the state machine; I ran `npm test` and fixed failures myself.
5. **Debugging** — When SQLite native module broke on Node 24, I pasted the exact error and worked with AI to switch to `node:sqlite`.
6. **Code review** — I asked AI to verify status is never updated outside `PATCH /status` and `statusMachine.js`.
7. **Documentation** — Prompt history, reflection, and submission package were built incrementally.

Full prompt log: `prompts/prompt-history.md` (19 prompts across 9 phases).

---

## Q3 — What were your key code and design decisions?

**Draft answer:**

| Decision | Why |
|----------|-----|
| **React + Vite + Express + SQLite** | Matches competency stack; SQLite persists locally with zero setup |
| **`node:sqlite` instead of `better-sqlite3`** | Native module failed on Node 24; built-in SQLite avoids rebuild issues |
| **`statusMachine.js` as single source of truth** | Business rules must not live in routes; easier to test |
| **Separate `PATCH /tickets/:id/status`** | Prevents accidental status change via field update (PUT) |
| **`allowedTransitions` in API response** | UI only shows valid next states — avoids user hitting 422 unnecessarily |
| **Atlassian-style UI + dark mode (Stretch)** | Better UX; added dashboard, board, filters, pagination |

**Repo pointers:**
- State machine: `backend/src/services/statusMachine.js`
- API routes: `backend/src/routes/tickets.js`
- Architecture: `docs/design.md`

---

## Q4 — What was your testing approach?

**Draft answer:**

Core requires **integration tests for the state machine**. I have **23 automated tests**:

- **10 tests** — `backend/tests/stateMachine.test.js`  
  Valid transitions pass; invalid transitions return 422; terminal states blocked.
- **13 tests** — `backend/tests/api.test.js`  
  Full API: health, stats, filters, pagination, CRUD, comments, validation.

I used **Jest + Supertest** with an **isolated test database** (`data/test-tickets.db`) so tests don't touch dev data.

Run: `npm test` from project root or `backend/`.

I also manually tested: create ticket → invalid status click → error toast; restart server → data persists.

---

## Q5 — How did you debug issues?

**Draft answer (be specific — these are real issues we hit):**

**Issue 1 — SQLite native module (Node version mismatch)**  
- **Symptom:** `better_sqlite3.node` compiled for wrong NODE_MODULE_VERSION  
- **Fix:** Replaced with Node built-in `node:sqlite` in `backend/src/db/database.js`  
- **Prompt:** Phase 6 in `prompts/prompt-history.md` (Prompt 6.1)

**Issue 2 — UI "Request failed"**  
- **Symptom:** Ticket list empty, red error  
- **Cause:** Backend not running on port 3001  
- **Fix:** Start backend first; improved error message in `frontend/src/api/client.js`

**Issue 3 — Partially working after UI redesign**  
- **Symptom:** Dashboard empty, stats API failed  
- **Cause:** Old backend still on port 3001 (outdated API returning array instead of `{ tickets, total }`)  
- **Fix:** Killed stale process, restarted backend; added `normalizeTicketList()` in API client

---

## Q6 — Point to where you fixed an AI mistake

**This is why you need Git commits.** After you commit, replace `COMMIT_HASH` below with real hashes.

### AI Mistake 1 — Invalid backward status transition

- **What AI suggested:** Allow `Resolved → In Progress`  
- **Why wrong:** Assessment PDF forbids backward transitions  
- **What I did:** Removed from transition map; only allowed edges from PDF  
- **File:** `backend/src/services/statusMachine.js`  
- **Suggested commit message:** `fix: enforce state machine per PDF — no backward transitions`  
- **Commit:** `COMMIT_HASH` *(fill after git commit)*

### AI Mistake 2 — Status updated via PUT handler

- **What AI suggested:** Include status in general ticket update endpoint  
- **Why wrong:** Violates separation; bypasses state machine validation  
- **What I did:** Status changes only via `PATCH /api/tickets/:id/status`  
- **File:** `backend/src/routes/tickets.js`  
- **Suggested commit message:** `fix: move status updates to dedicated PATCH endpoint`  
- **Commit:** `COMMIT_HASH`

### AI Mistake 3 — Native SQLite dependency

- **What AI used:** `better-sqlite3`  
- **Why wrong:** Broke on Node 24 with native module version error  
- **What I did:** Migrated to `node:sqlite`  
- **File:** `backend/src/db/database.js`, `backend/package.json`  
- **Suggested commit message:** `fix: replace better-sqlite3 with node:sqlite for Node 24 compatibility`  
- **Commit:** `COMMIT_HASH`

**Also document in:** `prompts/prompt-history.md` → "Iteration Log" section

---

## Q7 — What would you improve next?

**Draft answer (honest — from `docs/reflection.md`):**

1. **Authentication** — JWT login, protected routes, role-based permissions  
2. **OpenAPI/Swagger** — Document API for consumers  
3. **Docker Compose** — One command to start backend + frontend + DB  
4. **Unit tests** for `statusMachine.js` pure functions (in addition to integration tests)  
5. **CI pipeline** — Run `npm test` on every push  

Core is complete and tested; these are Stretch items I didn't fully implement.

---

## Q8 — Repository structure (where to find everything)

| Artifact | Path |
|----------|------|
| Part A — AI workflow | `tool-workflow.md` |
| Full prompt history | `prompts/prompt-history.md` |
| All docs in one file | `submission/Sahib-Bajaj-Complete-Submission.md` |
| Requirement analysis | `docs/requirement-analysis.md` |
| Design | `docs/design.md` |
| Reflection | `docs/reflection.md` |
| PR description | `docs/PR_DESCRIPTION.md` |
| Cursor specs | `tool-specific/cursor-workflow/` |
| State machine tests | `backend/tests/stateMachine.test.js` |
| Full API tests | `backend/tests/api.test.js` |
| README / setup | `README.md` |

---

## Suggested Commit Structure

Create these commits **before submitting** so you have real hashes for the form:

```
1. feat: initial Support Ticket Management Core (backend, frontend, docs)
2. feat: add state machine service and integration tests
3. fix: enforce state machine — reject invalid transitions (AI mistake correction)
4. fix: separate status PATCH endpoint from PUT updates (AI mistake correction)
5. fix: migrate to node:sqlite for Node 24 compatibility (AI mistake correction)
6. feat: professional UI redesign with dashboard, board, dark mode (Stretch)
7. fix: API client normalization and stale backend troubleshooting
8. docs: add submission package, prompt history, form answer prep
```

After each commit, run `git log --oneline` and fill in **Q6** commit hashes.

---

## Tips for Strong Form Answers

| Do | Don't |
|----|-------|
| Mention specific files and test counts | Say "I used AI to build everything" |
| Describe one real bug and how you fixed it | Copy generic answers from this doc |
| Admit what you didn't implement (auth, Docker) | Claim Stretch features you didn't build |
| Reference `prompts/prompt-history.md` phases | Submit prompt history without a working app |
| Point to `statusMachine.js` as judgment piece | Say you don't understand the state machine |

---

## Quick Self-Check Before Submitting

- [ ] `npm test` → 23/23 pass
- [ ] Backend + frontend both run locally
- [ ] Git repo pushed with clear commit history
- [ ] `submission/Sahib-Bajaj-Complete-Submission.md` included
- [ ] Form answers written **in your own words**
- [ ] At least one **commit hash** cited for an AI mistake fix

---

> **Note:** This file is a **prep guide only** — not for direct submission.  
> Rewrite every answer above in your own words on the competency form.  
> **Participant:** Sahib Bajaj
