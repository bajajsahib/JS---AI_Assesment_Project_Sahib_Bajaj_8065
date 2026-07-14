# Project Context — Support Ticket Management System

## Overview

Internal support ticket application for creating, updating, commenting on, searching, and progressing tickets through a defined lifecycle. Built as the Core tier of the JS AI Capability Exercise.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | React 18 + Vite | Fast dev server, modern React patterns |
| Backend | Node.js + Express | Matches competency stack expectations |
| Database | SQLite (`node:sqlite`) | Built into Node 22.5+; no native rebuild issues |
| Testing | Jest + Supertest | Integration tests for API and state machine |
| Validation | express-validator | Declarative request validation |

## Repository Layout

```
support-ticket-management/
├── backend/          # Express API, DB, migrations, tests
├── frontend/         # React SPA
├── docs/             # Requirement analysis, design, reflection
├── prompts/          # AI prompt history
├── tool-specific/    # Cursor workflow artifacts
└── tool-workflow.md  # Part A submission
```

## Domain Model

- **User** (seeded): id, name, email, role
- **Ticket**: id, title, description, priority, status, assignedTo, createdBy, createdAt, updatedAt
- **Comment**: id, ticketId, message, createdBy, createdAt

## Status State Machine (Core Signature)

```
Open        → In Progress | Cancelled
In Progress → Resolved    | Cancelled
Resolved    → Closed
Closed      → (terminal)
Cancelled   → (terminal)
```

Invalid transitions MUST be rejected by the backend (HTTP 422) and surfaced clearly in the UI.

## Non-Goals (Core)

- Authentication / authorization
- User management UI
- Pagination, sorting (Stretch)

## Environment

- `PORT` — backend port (default 3001)
- `DATABASE_PATH` — SQLite file path (default `./data/tickets.db`)
- `VITE_API_URL` — frontend API base URL (default `http://localhost:3001/api`)

## Conventions

- REST API under `/api`
- JSON request/response bodies
- ISO 8601 timestamps
- Meaningful HTTP status codes (400 validation, 404 not found, 422 business rule violation)
- No secrets in repository

