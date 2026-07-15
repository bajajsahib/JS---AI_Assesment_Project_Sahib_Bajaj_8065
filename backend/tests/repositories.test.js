import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDbPath = path.join(__dirname, '../data/repo-unit-test.db');

// Isolate this suite on its own database file so it never touches dev data.
process.env.DATABASE_PATH = testDbPath;

if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

await import('../src/db/migrate.js');
await import('../src/db/seed.js');

const {
  findAllTickets,
  getTicketStats,
  findTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  findCommentsByTicketId,
  createComment,
} = await import('../src/repositories/ticketRepository.js');

const { findAllUsers, findUserById } = await import('../src/repositories/userRepository.js');

describe('userRepository', () => {
  it('findAllUsers returns seeded users sorted by name ASC', () => {
    const users = findAllUsers();
    expect(users.length).toBe(4);
    // Alphabetical: Bob, Carol, David, Sahib
    expect(users[0].name).toBe('Bob Smith');
    expect(users[users.length - 1].name).toBe('Sahib Bajaj');
    expect(Object.keys(users[0]).sort()).toEqual(['email', 'id', 'name', 'role']);
  });

  it('findUserById returns the matching user', () => {
    const user = findUserById(1);
    expect(user).toBeDefined();
    expect(user.id).toBe(1);
  });

  // Edge case: unknown id must not throw, returns undefined.
  it('findUserById returns undefined for a non-existent id', () => {
    expect(findUserById(999999)).toBeUndefined();
  });
});

describe('ticketRepository — reads (seeded data)', () => {
  it('findAllTickets returns the three seeded tickets with pagination metadata', () => {
    const result = findAllTickets();
    expect(result.tickets.length).toBe(3);
    expect(result.total).toBe(3);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
  });

  it('filters by status', () => {
    const { tickets, total } = findAllTickets({ status: 'Open' });
    expect(total).toBe(1);
    expect(tickets[0].status).toBe('Open');
  });

  it('filters by priority', () => {
    const { tickets, total } = findAllTickets({ priority: 'High' });
    expect(total).toBe(1);
    expect(tickets[0].priority).toBe('High');
  });

  it('search matches title case-insensitively', () => {
    const { tickets, total } = findAllTickets({ search: 'printer' });
    expect(total).toBe(1);
    expect(tickets[0].title).toMatch(/Printer/);
  });

  // Edge case: limit is clamped to a maximum of 100 to bound query cost.
  it('clamps limit above 100 down to 100', () => {
    const result = findAllTickets({ limit: 500 });
    expect(result.limit).toBe(100);
  });

  // Edge case: page below 1 is clamped to 1 to avoid negative offsets.
  it('clamps page below 1 up to 1', () => {
    const result = findAllTickets({ page: 0 });
    expect(result.page).toBe(1);
  });

  it('computes totalPages from total and limit', () => {
    const result = findAllTickets({ limit: 2 });
    expect(result.tickets.length).toBe(2);
    expect(result.totalPages).toBe(2);
  });

  it('getTicketStats aggregates counts by status and priority', () => {
    const stats = getTicketStats();
    expect(stats.total).toBe(3);
    // Open + In Progress
    expect(stats.openCount).toBe(2);
    // Resolved + Closed
    expect(stats.resolvedCount).toBe(1);
    expect(stats.byStatus.Open).toBe(1);
    expect(stats.byPriority.High).toBe(1);
  });

  // Edge case: unknown id returns undefined rather than throwing.
  it('findTicketById returns undefined for a non-existent id', () => {
    expect(findTicketById(999999)).toBeUndefined();
  });
});

describe('ticketRepository — writes', () => {
  it('createTicket inserts with status Open and resolves joined names', () => {
    const ticket = createTicket({
      title: 'New laptop request',
      description: 'Need a replacement laptop.',
      priority: 'Medium',
      assignedTo: 2,
      createdBy: 1,
    });
    expect(ticket.id).toBeDefined();
    expect(ticket.status).toBe('Open');
    expect(ticket.assigneeName).toBe('Bob Smith');
    expect(ticket.creatorName).toBe('Sahib Bajaj');
  });

  // Edge case: assignedTo is optional and stored as null when omitted.
  it('createTicket allows a null assignee', () => {
    const ticket = createTicket({
      title: 'Unassigned ticket',
      description: 'No assignee yet.',
      priority: 'Low',
      createdBy: 1,
    });
    expect(ticket.assignedTo).toBeNull();
    expect(ticket.assigneeName).toBeNull();
  });

  it('updateTicket updates provided fields and returns the fresh row', () => {
    const created = createTicket({
      title: 'Original title',
      description: 'Original description.',
      priority: 'Low',
      createdBy: 1,
    });
    const updated = updateTicket(created.id, { title: 'Updated title' });
    expect(updated.title).toBe('Updated title');
    // Untouched fields are preserved.
    expect(updated.description).toBe('Original description.');
  });

  // Failure mode: updating a missing ticket returns null (no throw).
  it('updateTicket returns null for a non-existent id', () => {
    expect(updateTicket(999999, { title: 'x' })).toBeNull();
  });

  it('updateTicketStatus changes only the status', () => {
    const created = createTicket({
      title: 'Status change ticket',
      description: 'Move me along.',
      priority: 'Medium',
      createdBy: 1,
    });
    const updated = updateTicketStatus(created.id, 'In Progress');
    expect(updated.status).toBe('In Progress');
  });

  // Failure mode: status update on a missing ticket returns null.
  it('updateTicketStatus returns null for a non-existent id', () => {
    expect(updateTicketStatus(999999, 'Closed')).toBeNull();
  });

  it('createComment and findCommentsByTicketId round-trip with author name', () => {
    const comment = createComment({ ticketId: 1, message: 'Following up.', createdBy: 3 });
    expect(comment.id).toBeDefined();
    expect(comment.authorName).toBe('Carol Davis');

    const comments = findCommentsByTicketId(1);
    expect(comments.some((c) => c.id === comment.id)).toBe(true);
  });

  // Edge case: a ticket with no comments returns an empty array.
  it('findCommentsByTicketId returns an empty array when there are none', () => {
    const created = createTicket({
      title: 'Comment-free ticket',
      description: 'No comments here.',
      priority: 'Low',
      createdBy: 1,
    });
    expect(findCommentsByTicketId(created.id)).toEqual([]);
  });
});
