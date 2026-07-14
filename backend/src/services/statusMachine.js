const VALID_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed', 'Cancelled'];

const TRANSITIONS = {
  Open: ['In Progress', 'Cancelled'],
  'In Progress': ['Resolved', 'Cancelled'],
  Resolved: ['Closed'],
  Closed: [],
  Cancelled: [],
};

export function isValidStatus(status) {
  return VALID_STATUSES.includes(status);
}

export function canTransition(fromStatus, toStatus) {
  if (!isValidStatus(fromStatus) || !isValidStatus(toStatus)) {
    return false;
  }
  return TRANSITIONS[fromStatus].includes(toStatus);
}

export function getAllowedTransitions(fromStatus) {
  if (!isValidStatus(fromStatus)) {
    return [];
  }
  return [...TRANSITIONS[fromStatus]];
}

export function assertTransition(fromStatus, toStatus) {
  if (!canTransition(fromStatus, toStatus)) {
    const allowed = getAllowedTransitions(fromStatus);
    const allowedMsg = allowed.length > 0 ? allowed.join(', ') : 'none (terminal state)';
    throw new StatusTransitionError(
      `Invalid status transition from "${fromStatus}" to "${toStatus}". Allowed: ${allowedMsg}.`
    );
  }
}

export class StatusTransitionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StatusTransitionError';
    this.statusCode = 422;
  }
}
