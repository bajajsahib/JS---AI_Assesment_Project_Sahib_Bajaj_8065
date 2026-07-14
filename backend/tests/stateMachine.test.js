import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDbPath = path.join(__dirname, '../data/test-tickets.db');

process.env.DATABASE_PATH = testDbPath;

if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
}

await import('../src/db/migrate.js');
await import('../src/db/seed.js');

const { default: app } = await import('../src/app.js');

describe('Ticket Status State Machine', () => {
  let ticketId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        title: 'State machine test ticket',
        description: 'Used for integration tests',
        priority: 'Medium',
      });

    expect(res.status).toBe(201);
    ticketId = res.body.id;
    expect(res.body.status).toBe('Open');
  });

  describe('valid transitions', () => {
    it('Open -> In Progress succeeds', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${ticketId}/status`)
        .send({ status: 'In Progress' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('In Progress');
    });

    it('In Progress -> Resolved succeeds', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${ticketId}/status`)
        .send({ status: 'Resolved' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Resolved');
    });

    it('Resolved -> Closed succeeds', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${ticketId}/status`)
        .send({ status: 'Closed' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Closed');
      expect(res.body.allowedTransitions).toEqual([]);
    });
  });

  describe('invalid transitions', () => {
    let openTicketId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Invalid transition test',
          description: 'Testing rejections',
          priority: 'Low',
        });
      openTicketId = res.body.id;
    });

    it('Open -> Resolved is rejected', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${openTicketId}/status`)
        .send({ status: 'Resolved' });

      expect(res.status).toBe(422);
      expect(res.body.error).toMatch(/Invalid status transition/);
    });

    it('Open -> Closed is rejected', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${openTicketId}/status`)
        .send({ status: 'Closed' });

      expect(res.status).toBe(422);
      expect(res.body.error).toMatch(/Invalid status transition/);
    });

    it('In Progress -> Open is rejected', async () => {
      await request(app)
        .patch(`/api/tickets/${openTicketId}/status`)
        .send({ status: 'In Progress' });

      const res = await request(app)
        .patch(`/api/tickets/${openTicketId}/status`)
        .send({ status: 'Open' });

      expect(res.status).toBe(422);
      expect(res.body.error).toMatch(/Invalid status transition/);
    });
  });

  describe('terminal states', () => {
    it('Closed cannot transition', async () => {
      const res = await request(app)
        .patch(`/api/tickets/${ticketId}/status`)
        .send({ status: 'Open' });

      expect(res.status).toBe(422);
      expect(res.body.error).toMatch(/terminal state/);
    });

    it('Cancelled cannot transition', async () => {
      const createRes = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Cancel test',
          description: 'Will be cancelled',
          priority: 'Low',
        });

      const id = createRes.body.id;

      await request(app)
        .patch(`/api/tickets/${id}/status`)
        .send({ status: 'Cancelled' });

      const res = await request(app)
        .patch(`/api/tickets/${id}/status`)
        .send({ status: 'In Progress' });

      expect(res.status).toBe(422);
      expect(res.body.error).toMatch(/terminal state/);
    });
  });

  describe('Open -> Cancelled path', () => {
    it('Open -> Cancelled succeeds', async () => {
      const createRes = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Cancel path test',
          description: 'Direct cancel from open',
          priority: 'High',
        });

      const res = await request(app)
        .patch(`/api/tickets/${createRes.body.id}/status`)
        .send({ status: 'Cancelled' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Cancelled');
    });
  });

  describe('In Progress -> Cancelled path', () => {
    it('In Progress -> Cancelled succeeds', async () => {
      const createRes = await request(app)
        .post('/api/tickets')
        .send({
          title: 'In progress cancel test',
          description: 'Cancel from in progress',
          priority: 'Medium',
        });

      const id = createRes.body.id;

      await request(app)
        .patch(`/api/tickets/${id}/status`)
        .send({ status: 'In Progress' });

      const res = await request(app)
        .patch(`/api/tickets/${id}/status`)
        .send({ status: 'Cancelled' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Cancelled');
    });
  });
});

afterAll(async () => {
  const { closeDatabase } = await import('../src/db/database.js');
  closeDatabase();
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  const wal = `${testDbPath}-wal`;
  const shm = `${testDbPath}-shm`;
  if (fs.existsSync(wal)) fs.unlinkSync(wal);
  if (fs.existsSync(shm)) fs.unlinkSync(shm);
});
