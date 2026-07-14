# Git Commit Guide — Sahib Bajaj

The participation form asks for **specific commits** (e.g. where you fixed an AI mistake).  
Your project needs an organized Git history before submission.

## One-time setup

```powershell
cd support-ticket-management
git init
git add .
git commit -m "feat: Support Ticket Management System — Core application and docs"
```

## Recommended follow-up commits (optional but strong for form)

If everything is already in one commit, you can still point to **files and prompt history**.  
For stronger evidence, re-commit logical chunks or use `git commit --amend` only if not pushed.

Ideal history:

| Order | Commit message | What it shows |
|-------|----------------|---------------|
| 1 | `feat: add backend API, state machine, and database layer` | Core backend |
| 2 | `test: add state machine and API integration tests (23 tests)` | Testing discipline |
| 3 | `fix: reject invalid status transitions per assessment PDF` | AI mistake corrected |
| 4 | `fix: use node:sqlite instead of better-sqlite3` | Debugging / Node 24 fix |
| 5 | `feat: professional UI with dashboard, board, and dark mode` | Stretch |
| 6 | `docs: submission package and prompt history for assessment` | Lifecycle artifacts |

## Form question example

> *"Point to the commit where you fixed an AI mistake."*

**Answer template:**
```
Commit: <hash from git log>
File: backend/src/services/statusMachine.js
Mistake: AI initially allowed Resolved → In Progress.
Fix: Removed invalid transition; only PDF-allowed edges remain.
Verified by: backend/tests/stateMachine.test.js (10 tests pass)
```

## Push to remote

```powershell
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

Share the **Git repository link** in the participation form.
