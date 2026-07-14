const API_BASE = import.meta.env.VITE_API_URL || '/api';

const BACKEND_HINT =
  'Cannot reach the API. Start the backend: cd backend && npm run setup && npm start';

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.error ||
      (data.errors && data.errors.map((e) => e.message).join('; ')) ||
      (response.status === 502 || response.status === 500
        ? BACKEND_HINT
        : `Request failed (HTTP ${response.status})`);
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function apiFetch(url, options) {
  return fetch(url, options)
    .then(parseResponse)
    .catch((err) => {
      if (err.status) throw err;
      throw new Error(BACKEND_HINT);
    });
}

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

function normalizeTicketList(data) {
  if (Array.isArray(data)) {
    return {
      tickets: data,
      total: data.length,
      page: 1,
      limit: data.length || 20,
      totalPages: 1,
    };
  }
  return {
    tickets: data.tickets ?? [],
    total: data.total ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? 20,
    totalPages: data.totalPages ?? 1,
  };
}

export const api = {
  getTickets: (params = {}) =>
    apiFetch(`${API_BASE}/tickets${buildQuery(params)}`).then(normalizeTicketList),

  getTicketStats: () => apiFetch(`${API_BASE}/tickets/stats`),

  getTicket: (id) => apiFetch(`${API_BASE}/tickets/${id}`),

  createTicket: (body) =>
    apiFetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  updateTicket: (id, body) =>
    apiFetch(`${API_BASE}/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  updateStatus: (id, status) =>
    apiFetch(`${API_BASE}/tickets/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),

  addComment: (id, message) =>
    apiFetch(`${API_BASE}/tickets/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    }),

  getUsers: () => apiFetch(`${API_BASE}/users`),
};

export function formatApiError(err) {
  if (err?.data?.errors?.length) {
    return err.data.errors.map((e) => e.message).join('; ');
  }
  return err?.message || 'An unexpected error occurred';
}
