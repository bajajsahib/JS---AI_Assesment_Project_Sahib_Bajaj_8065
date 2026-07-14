import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDbPath = path.join(__dirname, '../data/api-test-tickets.db');

process.env.DATABASE_PATH = testDbPath;

if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

await import('../src/db/migrate.js');
await import('../src/db/seed.js');

const { default: app } = await import('../src/app.js');

describe('Full API Integration', () => {
  let ticketId;

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/users returns seeded users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(4);
  });

  it('GET /api/tickets/stats returns dashboard stats', async () => {
    const res = await request(app).get('/api/tickets/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('byStatus');
    expect(res.body).toHaveProperty('openCount');
  });

  it('GET /api/tickets returns paginated list', async () => {
    const res = await request(app).get('/api/tickets?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tickets');
    expect(res.body).toHaveProperty('total');
    expect(res.body.tickets.length).toBeLessThanOrEqual(2);
  });

  it('GET /api/tickets filters by status', async () => {
    const res = await request(app).get('/api/tickets?status=Open');
    expect(res.status).toBe(200);
    res.body.tickets.forEach((t) => expect(t.status).toBe('Open'));
  });

  it('GET /api/tickets filters by priority', async () => {
    const res = await request(app).get('/api/tickets?priority=High');
    expect(res.status).toBe(200);
    res.body.tickets.forEach((t) => expect(t.priority).toBe('High'));
  });

  it('GET /api/tickets searches by keyword', async () => {
    const res = await request(app).get('/api/tickets?search=VPN');
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/tickets creates a ticket', async () => {
    const res = await request(app).post('/api/tickets').send({
      title: 'API E2E ticket',
      description: 'Full test ticket',
      priority: 'Medium',
      assignedTo: 2,
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('Open');
    ticketId = res.body.id;
  });

  it('GET /api/tickets/:id returns detail with comments', async () => {
    const res = await request(app).get(`/api/tickets/${ticketId}`);
    expect(res.status).toBe(200);
    expect(res.body.comments).toBeDefined();
    expect(res.body.allowedTransitions).toContain('In Progress');
  });

  it('PUT /api/tickets/:id updates fields', async () => {
    const res = await request(app).put(`/api/tickets/${ticketId}`).send({
      title: 'Updated title',
      priority: 'Critical',
    });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated title');
    expect(res.body.priority).toBe('Critical');
  });

  it('POST /api/tickets/:id/comments adds comment', async () => {
    const res = await request(app).post(`/api/tickets/${ticketId}/comments`).send({
      message: 'Test comment from E2E',
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Test comment from E2E');
  });

  it('PATCH /api/tickets/:id/status transitions status', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}/status`)
      .send({ status: 'In Progress' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('In Progress');
  });

  it('POST /api/tickets rejects invalid input', async () => {
    const res = await request(app).post('/api/tickets').send({
      title: '',
      description: '',
      priority: 'Invalid',
    });
    expect(res.status).toBe(400);
  });
});

afterAll(() => {
  import('../src/db/database.js').then(({ closeDatabase }) => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    const wal = `${testDbPath}-wal`;
    const shm = `${testDbPath}-shm`;
    if (fs.existsSync(wal)) fs.unlinkSync(wal);
    if (fs.existsSync(shm)) fs.unlinkSync(shm);
  });
});
