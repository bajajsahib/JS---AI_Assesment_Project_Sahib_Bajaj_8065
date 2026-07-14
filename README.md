# Support Ticket Management System

AI Capability Exercise — Core tier. Full-stack app for managing support tickets with enforced status lifecycle.

## Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite via Node.js built-in `node:sqlite` (no native addons)

## Prerequisites

- Node.js **22.5+** (built-in SQLite support) and npm

## Quick Start

> **Important:** Both backend and frontend must be running. If you see empty lists or errors, stop old servers first (see Troubleshooting below).

### One-time setup

```bash
npm run setup
```

### Run the application

**Terminal 1 — Backend (start this first):**
```bash
npm run backend
# → http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
npm run frontend
# → http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### 3. Run Tests

```bash
npm test
```

Runs **23 automated tests** covering the state machine and full API (health, stats, filters, CRUD, comments, validation).

## Troubleshooting

### "Request failed" or empty ticket list

The backend is not running, or an **old backend** is still on port 3001.

**Windows — find and stop old process:**
```powershell
netstat -ano | findstr :3001
taskkill /PID <pid> /F
npm run backend
```

### Port already in use

```powershell
netstat -ano | findstr :3001
taskkill /PID <pid> /F
```

Then restart: `npm run backend`

### Frontend on wrong port (5174 instead of 5173)

Another Vite instance is running. Stop it:
```powershell
netstat -ano | findstr :5173
taskkill /PID <pid> /F
npm run frontend
```

### Verify backend is working

Open http://localhost:3001/api/health — should show `{"status":"ok"}`  
Open http://localhost:3001/api/tickets/stats — should show ticket counts

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend port |
| `DATABASE_PATH` | `./data/tickets.db` | SQLite file path |
| `VITE_API_URL` | `/api` (proxied) | Frontend API base URL |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/users` | List seeded users |
| GET | `/api/tickets?search=&status=` | List/filter tickets |
| POST | `/api/tickets` | Create ticket |
| GET | `/api/tickets/:id` | Ticket detail + comments |
| PUT | `/api/tickets/:id` | Update fields |
| PATCH | `/api/tickets/:id/status` | Status transition |
| POST | `/api/tickets/:id/comments` | Add comment |

## Status State Machine

```
Open        → In Progress | Cancelled
In Progress → Resolved    | Cancelled
Resolved    → Closed
Closed      → (terminal)
Cancelled   → (terminal)
```

Invalid transitions return **HTTP 422**.

## Project Structure

```
├── backend/                 # Express API
│   ├── src/db/              # migrate.js, seed.js
│   ├── src/services/        # statusMachine.js
│   ├── tests/               # integration tests
│   └── package.json
├── frontend/                # React SPA
├── docs/                    # analysis, design, reflection
├── prompts/                 # AI prompt history
├── tool-specific/cursor-workflow/  # Cursor artifacts
├── tool-workflow.md         # Part A submission
└── .cursor/rules/           # Cursor project rules
```

## Seeded Data

- 4 users (1 admin, 3 agents)
- 3 sample tickets with comments

## Submission Artifacts

| Part | Location |
|------|----------|
| A — AI Workflow | `tool-workflow.md` |
| B — Application | `backend/`, `frontend/` |
| B — All docs in one file | **`submission/Sahib-Bajaj-Complete-Submission.md`** |
| B — Organized submission folder | `submission/` |
| Cursor tool-specific | `tool-specific/cursor-workflow/` |
| Prompt history | `prompts/prompt-history.md` |
| Reflection | `docs/reflection.md` |
| PR description | `docs/PR_DESCRIPTION.md` |

**Participant:** Sahib Bajaj

## License

Internal assessment project.
