# Implementation Tasks

## Phase 1 — Foundation
- [x] Create repository structure and Cursor workflow artifacts
- [x] Write requirement analysis and design docs
- [x] Configure `.cursor/rules` for project conventions
- [x] Add `tool-workflow.md` (Part A)

## Phase 2 — Backend
- [x] Initialize Express app with CORS and JSON middleware
- [x] SQLite schema migration script (`backend/src/db/migrate.js`)
- [x] Seed script with sample users and tickets (`backend/src/db/seed.js`)
- [x] State machine service (`backend/src/services/statusMachine.js`)
- [x] Ticket, user, comment repositories
- [x] REST routes with express-validator
- [x] Global error handler

## Phase 3 — Frontend
- [x] Vite + React scaffold
- [x] API client with error parsing
- [x] Ticket list with search and status filter
- [x] Create ticket form
- [x] Ticket detail with edit, status transitions, comments
- [x] Error banners for API failures

## Phase 4 — Testing & Docs
- [x] State machine integration tests (Jest + Supertest)
- [x] README with setup instructions
- [x] `.env.example`
- [x] Prompt history document
- [x] Reflection and PR description templates

## Phase 5 — Stretch (Optional, not in Core)
- [ ] JWT authentication
- [ ] Filter by priority/assignee, pagination
- [ ] Swagger/OpenAPI
- [ ] Docker + CI

