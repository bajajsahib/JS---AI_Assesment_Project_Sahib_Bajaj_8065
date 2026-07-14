import { Router } from 'express';
import {
  findAllTickets,
  findTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  findCommentsByTicketId,
  createComment,
  getTicketStats,
} from '../repositories/ticketRepository.js';
import { findUserById } from '../repositories/userRepository.js';
import { assertTransition, getAllowedTransitions } from '../services/statusMachine.js';
import {
  listTicketsValidation,
  createTicketValidation,
  updateTicketValidation,
  ticketIdValidation,
  statusTransitionValidation,
  createCommentValidation,
} from '../validators/ticketValidators.js';

const router = Router();
const DEFAULT_USER_ID = 1;

router.get('/stats', (_req, res) => {
  res.json(getTicketStats());
});

router.get('/', listTicketsValidation, (req, res) => {
  const { search, status, priority, assignedTo, sortBy, sortOrder, page, limit } = req.query;
  res.json(
    findAllTickets({
      search,
      status,
      priority,
      assignedTo,
      sortBy,
      sortOrder,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    })
  );
});

router.post('/', createTicketValidation, (req, res) => {
  const { title, description, priority, assignedTo, createdBy } = req.body;

  if (assignedTo) {
    const assignee = findUserById(assignedTo);
    if (!assignee) {
      return res.status(400).json({ error: 'Assigned user does not exist' });
    }
  }

  const creatorId = createdBy || DEFAULT_USER_ID;
  const creator = findUserById(creatorId);
  if (!creator) {
    return res.status(400).json({ error: 'Creator user does not exist' });
  }

  const ticket = createTicket({
    title,
    description,
    priority,
    assignedTo: assignedTo ?? null,
    createdBy: creatorId,
  });

  res.status(201).json(ticket);
});

router.get('/:id', ticketIdValidation, (req, res) => {
  const ticket = findTicketById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const comments = findCommentsByTicketId(ticket.id);
  const allowedTransitions = getAllowedTransitions(ticket.status);

  res.json({ ...ticket, comments, allowedTransitions });
});

router.put('/:id', updateTicketValidation, (req, res) => {
  const ticket = findTicketById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  if (req.body.assignedTo) {
    const assignee = findUserById(req.body.assignedTo);
    if (!assignee) {
      return res.status(400).json({ error: 'Assigned user does not exist' });
    }
  }

  const updated = updateTicket(ticket.id, req.body);
  res.json(updated);
});

router.patch('/:id/status', statusTransitionValidation, (req, res) => {
  const ticket = findTicketById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  try {
    assertTransition(ticket.status, req.body.status);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }

  const updated = updateTicketStatus(ticket.id, req.body.status);
  res.json({
    ...updated,
    allowedTransitions: getAllowedTransitions(updated.status),
  });
});

router.post('/:id/comments', createCommentValidation, (req, res) => {
  const ticket = findTicketById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const creatorId = req.body.createdBy || DEFAULT_USER_ID;
  const creator = findUserById(creatorId);
  if (!creator) {
    return res.status(400).json({ error: 'Comment author does not exist' });
  }

  const comment = createComment({
    ticketId: ticket.id,
    message: req.body.message,
    createdBy: creatorId,
  });

  res.status(201).json(comment);
});

export default router;
