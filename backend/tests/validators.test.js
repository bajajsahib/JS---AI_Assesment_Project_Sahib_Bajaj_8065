import { validationResult } from 'express-validator';
import {
  createTicketValidation,
  updateTicketValidation,
  listTicketsValidation,
  ticketIdValidation,
  statusTransitionValidation,
  createCommentValidation,
} from '../src/validators/ticketValidators.js';

function mockReq({ body = {}, query = {}, params = {} } = {}) {
  return { body, query, params };
}

// Runs the express-validator chains in a rule array against a mock request.
// The trailing handleValidation middleware has no `.run` method and is skipped.
async function runValidation(chains, req) {
  for (const chain of chains) {
    if (chain && typeof chain.run === 'function') {
      await chain.run(req);
    }
  }
  return validationResult(req);
}

function fieldsWithErrors(result) {
  return result.array().map((e) => e.path);
}

describe('createTicketValidation', () => {
  it('passes for a valid payload', async () => {
    const req = mockReq({
      body: { title: 'Broken login', description: 'Cannot log in', priority: 'High' },
    });
    const result = await runValidation(createTicketValidation, req);
    expect(result.isEmpty()).toBe(true);
  });

  it('rejects a missing title', async () => {
    const req = mockReq({ body: { description: 'x', priority: 'High' } });
    const result = await runValidation(createTicketValidation, req);
    expect(result.isEmpty()).toBe(false);
    expect(fieldsWithErrors(result)).toContain('title');
  });

  it('rejects a missing description', async () => {
    const req = mockReq({ body: { title: 'x', priority: 'High' } });
    const result = await runValidation(createTicketValidation, req);
    expect(fieldsWithErrors(result)).toContain('description');
  });

  it('rejects an invalid priority', async () => {
    const req = mockReq({ body: { title: 'x', description: 'y', priority: 'Urgent' } });
    const result = await runValidation(createTicketValidation, req);
    expect(fieldsWithErrors(result)).toContain('priority');
  });

  it('rejects a non-integer assignedTo', async () => {
    const req = mockReq({
      body: { title: 'x', description: 'y', priority: 'Low', assignedTo: 'abc' },
    });
    const result = await runValidation(createTicketValidation, req);
    expect(fieldsWithErrors(result)).toContain('assignedTo');
  });

  // Edge case: assignedTo is optional and explicitly nullable.
  it('accepts a null assignedTo', async () => {
    const req = mockReq({
      body: { title: 'x', description: 'y', priority: 'Low', assignedTo: null },
    });
    const result = await runValidation(createTicketValidation, req);
    expect(result.isEmpty()).toBe(true);
  });
});

describe('updateTicketValidation', () => {
  it('rejects a non-integer id param', async () => {
    const req = mockReq({ params: { id: 'abc' }, body: { title: 'x' } });
    const result = await runValidation(updateTicketValidation, req);
    expect(fieldsWithErrors(result)).toContain('id');
  });

  it('accepts a valid partial update', async () => {
    const req = mockReq({ params: { id: '5' }, body: { title: 'Updated' } });
    const result = await runValidation(updateTicketValidation, req);
    expect(result.isEmpty()).toBe(true);
  });

  // Edge case: a provided-but-empty title is rejected.
  it('rejects an empty title when provided', async () => {
    const req = mockReq({ params: { id: '5' }, body: { title: '   ' } });
    const result = await runValidation(updateTicketValidation, req);
    expect(fieldsWithErrors(result)).toContain('title');
  });
});

describe('statusTransitionValidation', () => {
  it('accepts a valid status value', async () => {
    const req = mockReq({ params: { id: '1' }, body: { status: 'Resolved' } });
    const result = await runValidation(statusTransitionValidation, req);
    expect(result.isEmpty()).toBe(true);
  });

  it('rejects an unknown status value', async () => {
    const req = mockReq({ params: { id: '1' }, body: { status: 'Frozen' } });
    const result = await runValidation(statusTransitionValidation, req);
    expect(fieldsWithErrors(result)).toContain('status');
  });
});

describe('createCommentValidation', () => {
  it('rejects an empty message', async () => {
    const req = mockReq({ params: { id: '1' }, body: { message: '' } });
    const result = await runValidation(createCommentValidation, req);
    expect(fieldsWithErrors(result)).toContain('message');
  });

  it('accepts a valid comment', async () => {
    const req = mockReq({ params: { id: '1' }, body: { message: 'Looks good' } });
    const result = await runValidation(createCommentValidation, req);
    expect(result.isEmpty()).toBe(true);
  });
});

describe('listTicketsValidation', () => {
  it('rejects an invalid status filter', async () => {
    const req = mockReq({ query: { status: 'Nope' } });
    const result = await runValidation(listTicketsValidation, req);
    expect(fieldsWithErrors(result)).toContain('status');
  });

  // Edge case: page must be >= 1.
  it('rejects page 0', async () => {
    const req = mockReq({ query: { page: '0' } });
    const result = await runValidation(listTicketsValidation, req);
    expect(fieldsWithErrors(result)).toContain('page');
  });

  it('accepts a valid filter/sort/paging combination', async () => {
    const req = mockReq({
      query: { status: 'Open', sortBy: 'priority', sortOrder: 'asc', page: '2', limit: '10' },
    });
    const result = await runValidation(listTicketsValidation, req);
    expect(result.isEmpty()).toBe(true);
  });
});

describe('ticketIdValidation', () => {
  it('rejects a non-integer id', async () => {
    const req = mockReq({ params: { id: 'x' } });
    const result = await runValidation(ticketIdValidation, req);
    expect(fieldsWithErrors(result)).toContain('id');
  });

  it('accepts a valid integer id', async () => {
    const req = mockReq({ params: { id: '3' } });
    const result = await runValidation(ticketIdValidation, req);
    expect(result.isEmpty()).toBe(true);
  });
});
