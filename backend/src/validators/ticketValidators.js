import { body, param, query, validationResult } from 'express-validator';

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed', 'Cancelled'];

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

export const listTicketsValidation = [
  query('status').optional().isIn(STATUSES).withMessage('Invalid status filter'),
  query('priority').optional().isIn(PRIORITIES).withMessage('Invalid priority filter'),
  query('assignedTo').optional().isInt({ min: 1 }).withMessage('Invalid assignee filter'),
  query('sortBy').optional().isIn(['updatedAt', 'createdAt', 'priority', 'title', 'status']),
  query('sortOrder').optional().isIn(['asc', 'desc', 'ASC', 'DESC']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString().trim(),
  handleValidation,
];

export const createTicketValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('priority').isIn(PRIORITIES).withMessage('Priority must be Low, Medium, High, or Critical'),
  body('assignedTo').optional({ nullable: true }).isInt({ min: 1 }).withMessage('assignedTo must be a valid user id'),
  body('createdBy').optional().isInt({ min: 1 }),
  handleValidation,
];

export const updateTicketValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid ticket id'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('priority').optional().isIn(PRIORITIES).withMessage('Invalid priority'),
  body('assignedTo').optional({ nullable: true }).isInt({ min: 1 }).withMessage('assignedTo must be a valid user id'),
  handleValidation,
];

export const ticketIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid ticket id'),
  handleValidation,
];

export const statusTransitionValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid ticket id'),
  body('status').isIn(STATUSES).withMessage('Invalid status value'),
  handleValidation,
];

export const createCommentValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid ticket id'),
  body('message').trim().notEmpty().withMessage('Comment message is required'),
  body('createdBy').optional().isInt({ min: 1 }),
  handleValidation,
];
