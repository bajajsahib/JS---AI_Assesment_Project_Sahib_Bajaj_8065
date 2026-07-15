# Specification — Support Ticket Management System (Core)

## 1. Functional Requirements

### FR-1 Create Ticket
- User submits title (required), description (required), priority (required: Low | Medium | High | Critical), optional assignee (user id).
- Default status: `Open`. `createdBy` set from seeded default user (id=1) for Core (no auth).
- Returns created ticket with id and timestamps.

### FR-2 List Tickets
- Returns all tickets from database.
- Supports query params: `search` (keyword in title/description), `status` (exact match).
- Search and status filter may be combined.

### FR-3 View Ticket Detail
- Returns ticket with comments (ordered by createdAt asc) and populated assignee/creator names.

### FR-4 Update Ticket Fields
- PATCH/PUT allowed fields: title, description, priority, assignedTo.
- Status is NOT updated via this endpoint (separate transition endpoint).
- Validates assignee exists if provided.

### FR-5 Status Transition
- Dedicated endpoint: `PATCH /api/tickets/:id/status` with body `{ "status": "..." }`.
- Enforces state machine; invalid transitions return 422 with clear message.

### FR-6 Add Comment
- POST comment with required `message` on existing ticket.
- `createdBy` defaults to seeded user id=1.

### FR-7 Persistence
- All data stored in SQLite; survives application restart.

### FR-8 Validation & Errors
- Backend rejects missing/invalid fields with 400 and field-level errors.
- Frontend displays API errors in UI (banner or inline).

## 2. API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| GET | /api/users | List seeded users (for assignee dropdown) |
| GET | /api/tickets | List with search & status filter |
| POST | /api/tickets | Create ticket |
| GET | /api/tickets/:id | Ticket detail + comments |
| PUT | /api/tickets/:id | Update fields |
| PATCH | /api/tickets/:id/status | Status transition |
| POST | /api/tickets/:id/comments | Add comment |

## 3. Data Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| email | TEXT NOT NULL UNIQUE | |
| role | TEXT NOT NULL | agent, admin |

### tickets
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| title | TEXT NOT NULL | |
| description | TEXT NOT NULL | |
| priority | TEXT NOT NULL | Low, Medium, High, Critical |
| status | TEXT NOT NULL | Open, In Progress, Resolved, Closed, Cancelled |
| assigned_to | INTEGER FK users | nullable |
| created_by | INTEGER FK users NOT NULL | |
| created_at | TEXT NOT NULL | ISO 8601 |
| updated_at | TEXT NOT NULL | ISO 8601 |

### comments
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| ticket_id | INTEGER FK tickets NOT NULL | |
| message | TEXT NOT NULL | |
| created_by | INTEGER FK users NOT NULL | |
| created_at | TEXT NOT NULL | ISO 8601 |

## 4. UI Pages / Views

1. **Ticket List** — table/cards, search input, status filter dropdown, link to create and detail.
2. **Create Ticket** — form with validation feedback.
3. **Ticket Detail** — view/edit fields, status transition buttons (only valid next states), comment list + add comment.

## 5. Testing Requirements (Core)

Integration tests proving:
- Valid transitions succeed for each allowed edge.
- Invalid transitions are rejected with 422.
- Terminal states cannot transition.
