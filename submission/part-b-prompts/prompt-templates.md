# Prompt Templates — Reusable for Future Projects

Copy and adapt these templates when starting a similar AI-assisted full-stack project in Cursor.

---

## Template 1 — Requirement Analysis (start here)

```
Analyze @[requirements-document] and act as a software architect.

Before coding, provide:
1. Mandatory vs optional scope
2. Entity model with fields
3. Acceptance criteria as testable statements
4. Repository artifacts required for submission
5. Key business rules that need human judgment (not just CRUD)

Do NOT generate code yet.
```

---

## Template 2 — Architecture & Planning

```
Based on @project-context.md and @spec.md, propose a minimal architecture for [project name].

Requirements:
- [stack preferences]
- Must persist data across restarts
- [list non-goals]

Output: folder structure, API conventions, and phased task list in tasks.md.
```

---

## Template 3 — Core Business Logic (state machine / rules)

```
Implement [business rule] in a dedicated service module — NOT in route handlers.

Rules (from spec — strict, no exceptions):
[paste exact rules from requirements]

Export testable pure functions.
Invalid operations must throw errors with HTTP-ready status codes and clear messages.
```

---

## Template 4 — API Implementation

```
Build REST API endpoints following @spec.md exactly.

Validation: express-validator on all inputs
Error codes: 400 validation, 404 not found, 422 business rule violation
Do not mix [field X] updates into [wrong endpoint] — keep separate.

Follow @.cursor/rules/backend-api.mdc
```

---

## Template 5 — Mandatory Tests

```
Write integration tests proving [core business rule] from @acceptance-criteria.md.

Test matrix:
- All valid cases succeed
- All invalid cases rejected with correct status code
- Edge cases: [list them]

Use isolated test database. Clean up after tests.
```

---

## Template 6 — Frontend Page

```
Build [page name] for the React frontend following @spec.md.

Requirements:
- Show API errors clearly (400, 422, network failure)
- [UI-specific rules from acceptance criteria]
- Match patterns in @.cursor/rules/frontend-react.mdc
```

---

## Template 7 — Debug with Error Output

```
[Paste exact error message or screenshot description]

Diagnose root cause, fix it, and explain what was wrong.
Run tests to confirm the fix.
```

---

## Template 8 — Code Review

```
Review [files] and confirm:
1. [business rule] is not bypassed anywhere
2. Validation covers all mutating endpoints
3. No secrets or credentials in code
4. Tests still pass

Fix any violations found.
```

---

## Template 9 — Submission Checklist

```
Review my repository against [assessment PDF] "What Counts as Complete".
List missing artifacts and create them.
Ensure prompt history shows iteration, not just final output.
```

---

*Save as `prompts/prompt-templates.md` — reuse across future Cursor projects.*

