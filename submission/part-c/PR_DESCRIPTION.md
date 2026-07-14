# PR Description

**Participant:** Sahib Bajaj  
**Author:** Sahib Bajaj  

## Summary

Implements the **Support Ticket Management System (Core)** for the JS AI Capability Exercise.

- Express + SQLite backend with migration, seed data, validation, and state-machine enforcement
- React frontend with ticket list (search/filter), create form, and detail view with comments
- Integration tests proving valid/invalid status transitions
- Cursor workflow artifacts (`tool-specific/cursor-workflow/`), rules, and lifecycle documentation

## Test Plan

- [ ] `cd backend && npm run setup && npm test` — all state machine tests pass
- [ ] `cd backend && npm start` — API on :3001, `GET /api/health` returns ok
- [ ] `cd frontend && npm run dev` — UI on :5173
- [ ] Create ticket via UI; verify in list after refresh (persistence)
- [ ] Search by keyword; filter by status
- [ ] Update ticket fields and assignee
- [ ] Attempt invalid status transition — UI shows error
- [ ] Valid transitions along Open → In Progress → Resolved → Closed
- [ ] Add comment; verify on detail page

## AI Workflow Evidence

- `tool-workflow.md` — Part A
- `tool-specific/cursor-workflow/` — Cursor specs and rules
- `prompts/prompt-history.md` — prompt log

