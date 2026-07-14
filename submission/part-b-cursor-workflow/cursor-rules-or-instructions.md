# Cursor Rules & Instructions

This project uses **Cursor** as the primary AI tool. Persistent context is enforced through:

1. **`.cursor/rules/`** — always-on and file-scoped rules
2. **`tool-specific/cursor-workflow/`** — spec-driven documents (this folder)
3. **`@` references** — pointing Cursor at `spec.md`, `project-context.md`, or `acceptance-criteria.md` before implementation tasks

## How Context Is Provided

- Open `project-context.md` and `spec.md` at session start for new features
- Reference `acceptance-criteria.md` when writing or reviewing tests
- Use `tasks.md` to track progress; update when scope changes
- Pin the backend state machine file when working on status transitions

## Spec-Driven Workflow

```
Requirements (spec.md)
    → Design (docs/design.md)
    → Tasks (tasks.md)
    → Implementation (backend/ + frontend/)
    → Tests (acceptance-criteria.md matrix)
    → Review & update spec if drift occurs
```

## Iteration Beyond First Output

- State machine logic was specified first; AI-generated transition tables were reviewed against the PDF and corrected (no backward transitions).
- Validation rules were tightened after reviewing AI-suggested optional fields.
- Frontend error handling was refined after manual testing of 422 responses.

## Rules Files

| File | Scope |
|------|-------|
| `.cursor/rules/project-standards.mdc` | Always apply — stack, API conventions, no secrets |
| `.cursor/rules/backend-api.mdc` | `backend/**` — Express patterns, state machine |
| `.cursor/rules/frontend-react.mdc` | `frontend/**` — React component patterns |

## Information NOT Shared With AI

- Production credentials or internal company secrets
- Real customer PII
- Unrelated proprietary code from other projects

## Reuse In Real Projects

Copy `tool-specific/cursor-workflow/` structure, adapt `spec.md` and `acceptance-criteria.md` per feature, and maintain `.cursor/rules/` for team conventions. Treat AI output as a draft until validated against acceptance criteria and tests.

