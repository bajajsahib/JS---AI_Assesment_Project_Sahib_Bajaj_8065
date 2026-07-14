import db from '../db/database.js';

const ticketSelect = `
  SELECT
    t.id,
    t.title,
    t.description,
    t.priority,
    t.status,
    t.assigned_to AS assignedTo,
    t.created_by AS createdBy,
    t.created_at AS createdAt,
    t.updated_at AS updatedAt,
    assignee.name AS assigneeName,
    creator.name AS creatorName
  FROM tickets t
  LEFT JOIN users assignee ON t.assigned_to = assignee.id
  LEFT JOIN users creator ON t.created_by = creator.id
`;

const SORT_COLUMNS = {
  updatedAt: 't.updated_at',
  createdAt: 't.created_at',
  priority: 't.priority',
  title: 't.title',
  status: 't.status',
};

const PRIORITY_ORDER = `CASE t.priority
  WHEN 'Critical' THEN 1
  WHEN 'High' THEN 2
  WHEN 'Medium' THEN 3
  WHEN 'Low' THEN 4
  ELSE 5 END`;

function buildWhereClause({ search, status, priority, assignedTo }) {
  let where = ' WHERE 1=1';
  const params = {};

  if (status) {
    where += ' AND t.status = @status';
    params.status = status;
  }

  if (priority) {
    where += ' AND t.priority = @priority';
    params.priority = priority;
  }

  if (assignedTo) {
    where += ' AND t.assigned_to = @assignedTo';
    params.assignedTo = Number(assignedTo);
  }

  if (search) {
    where += ' AND (t.title LIKE @search OR t.description LIKE @search OR CAST(t.id AS TEXT) LIKE @search)';
    params.search = `%${search}%`;
  }

  return { where, params };
}

function buildOrderClause(sortBy, sortOrder) {
  const column = SORT_COLUMNS[sortBy] || SORT_COLUMNS.updatedAt;
  const direction = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  if (sortBy === 'priority') {
    return ` ORDER BY ${PRIORITY_ORDER} ${direction}`;
  }

  return ` ORDER BY ${column} ${direction}`;
}

export function findAllTickets({
  search,
  status,
  priority,
  assignedTo,
  sortBy = 'updatedAt',
  sortOrder = 'DESC',
  page = 1,
  limit = 20,
} = {}) {
  const { where, params } = buildWhereClause({ search, status, priority, assignedTo });
  const order = buildOrderClause(sortBy, sortOrder);
  const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 100);
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;

  const total = db.prepare(`SELECT COUNT(*) AS count FROM tickets t${where}`).get(params).count;

  const tickets = db
    .prepare(`${ticketSelect}${where}${order} LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit: safeLimit, offset });

  return {
    tickets,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
}

export function getTicketStats() {
  const total = db.prepare('SELECT COUNT(*) AS count FROM tickets').get().count;

  const byStatus = db
    .prepare('SELECT status, COUNT(*) AS count FROM tickets GROUP BY status')
    .all()
    .reduce((acc, row) => ({ ...acc, [row.status]: row.count }), {});

  const byPriority = db
    .prepare('SELECT priority, COUNT(*) AS count FROM tickets GROUP BY priority')
    .all()
    .reduce((acc, row) => ({ ...acc, [row.priority]: row.count }), {});

  const openCount = (byStatus.Open || 0) + (byStatus['In Progress'] || 0);
  const resolvedCount = (byStatus.Resolved || 0) + (byStatus.Closed || 0);

  return { total, byStatus, byPriority, openCount, resolvedCount };
}

export function findTicketById(id) {
  return db.prepare(`${ticketSelect} WHERE t.id = @id`).get({ id });
}

export function createTicket({ title, description, priority, assignedTo, createdBy }) {
  const now = new Date().toISOString();
  const result = db
    .prepare(`
      INSERT INTO tickets (title, description, priority, status, assigned_to, created_by, created_at, updated_at)
      VALUES (@title, @description, @priority, 'Open', @assignedTo, @createdBy, @now, @now)
    `)
    .run({ title, description, priority, assignedTo: assignedTo ?? null, createdBy, now });

  return findTicketById(Number(result.lastInsertRowid));
}

export function updateTicket(id, { title, description, priority, assignedTo }) {
  const existing = findTicketById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE tickets SET
      title = @title,
      description = @description,
      priority = @priority,
      assigned_to = @assignedTo,
      updated_at = @now
    WHERE id = @id
  `).run({
    id,
    title: title ?? existing.title,
    description: description ?? existing.description,
    priority: priority ?? existing.priority,
    assignedTo: assignedTo !== undefined ? assignedTo : existing.assignedTo,
    now,
  });

  return findTicketById(id);
}

export function updateTicketStatus(id, newStatus) {
  const existing = findTicketById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  db.prepare('UPDATE tickets SET status = @status, updated_at = @now WHERE id = @id').run({
    id,
    status: newStatus,
    now,
  });

  return findTicketById(id);
}

export function findCommentsByTicketId(ticketId) {
  return db
    .prepare(`
      SELECT
        c.id,
        c.ticket_id AS ticketId,
        c.message,
        c.created_by AS createdBy,
        c.created_at AS createdAt,
        u.name AS authorName
      FROM comments c
      JOIN users u ON c.created_by = u.id
      WHERE c.ticket_id = @ticketId
      ORDER BY c.created_at ASC
    `)
    .all({ ticketId });
}

export function createComment({ ticketId, message, createdBy }) {
  const now = new Date().toISOString();
  const result = db
    .prepare(`
      INSERT INTO comments (ticket_id, message, created_by, created_at)
      VALUES (@ticketId, @message, @createdBy, @now)
    `)
    .run({ ticketId, message, createdBy, now });

  return db
    .prepare(`
      SELECT
        c.id,
        c.ticket_id AS ticketId,
        c.message,
        c.created_by AS createdBy,
        c.created_at AS createdAt,
        u.name AS authorName
      FROM comments c
      JOIN users u ON c.created_by = u.id
      WHERE c.id = @id
    `)
    .get({ id: Number(result.lastInsertRowid) });
}
