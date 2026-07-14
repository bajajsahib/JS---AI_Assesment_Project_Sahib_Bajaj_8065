# Reflection

**Participant:** Sahib Bajaj  
**Project:** Support Ticket Management System  

## What Went Well

- Spec-driven approach kept the state machine correct on first implementation pass
- Cursor rules provided consistent conventions across backend and frontend sessions
- Integration tests gave high confidence on the hardest Core requirement

## Challenges

- Ensuring test database isolation (separate `test-tickets.db` for Jest)
- Frontend must not offer invalid status buttons — solved by API returning `allowedTransitions`

## AI Mistakes Caught

- Initial AI suggestion included `Resolved → In Progress` rollback — rejected per PDF spec
- AI occasionally put status updates in the general PUT handler — refactored to dedicated PATCH endpoint

## What I Would Improve (Stretch)

- Add authentication and role-based transition permissions
- OpenAPI documentation for API consumers
- Docker Compose for one-command startup
- Unit tests for `statusMachine.js` pure functions

## Ownership

I can explain every layer: migration schema, transition rules, validation middleware, and how the UI surfaces 422 errors. The state machine module is the single source of truth for business rules.
