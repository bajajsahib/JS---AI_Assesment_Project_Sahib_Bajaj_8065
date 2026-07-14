# AI Workflow — Part A

**Participant:** Sahib Bajaj  
**Project:** Support Ticket Management System  
**Primary AI Tool:** Cursor  

## 1. Primary AI Tool

**Cursor** — used for requirement analysis, architecture, implementation, testing, and documentation across the full lifecycle.

## 2. Project Context

- Persistent context via `tool-specific/cursor-workflow/project-context.md`, `spec.md`, and `.cursor/rules/`
- `@` file references in prompts to anchor AI to domain model and state machine rules
- Acceptance criteria document used as test oracle

## 3. Requirement Analysis

- PDF assessment parsed to extract Core vs Stretch scope
- State machine rules extracted as non-negotiable business constraints
- Entities and API surface mapped before any code generation

## 4. Planning & Design

- `spec.md` defines API contract, schema, and UI views
- `docs/design.md` captures architecture decisions
- `tasks.md` tracks phased implementation

## 5. Code Generation

- Backend generated in layers: DB → services → routes → tests
- Frontend generated page-by-page with shared API client
- AI output reviewed against spec; state machine kept in dedicated service module

## 6. Validation of AI Code

- Manual review of transition table against PDF rules
- Integration tests as executable specification
- Local smoke test of UI error paths (422 status transitions)

## 7. Testing with AI

- Prompted AI to generate state-machine integration test matrix
- Verified each valid/invalid edge from acceptance criteria
- Ran `npm test` in backend to confirm

## 8. Debugging with AI

- Used AI to diagnose SQLite path and test isolation issues
- Refined error response parsing in frontend API client

## 9. Code Review with AI

- Asked AI to review route handlers for direct status updates bypassing state machine
- Verified validation middleware coverage on all mutating endpoints

## 10. Information Avoided

- No production credentials, internal URLs, or real customer data
- No unrelated proprietary code from other employers/projects

## 11. Reuse in Real Projects

- Replicate `tool-specific/cursor-workflow/` + `.cursor/rules/` per project
- Maintain spec and acceptance criteria as living documents
- Treat AI as pair programmer: spec first, validate with tests, iterate on failures
