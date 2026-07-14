import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, formatApiError } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { PRIORITIES, STATUSES } from '../constants.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import Avatar from '../components/Avatar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';
import { formatDate, ticketKey } from '../utils/format.js';
import { IconPlus } from '../components/Icons.jsx';

export default function TicketList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const [data, setData] = useState({ tickets: [], total: 0, page: 1, totalPages: 1 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const assignedTo = searchParams.get('assignedTo') || '';
  const sortBy = searchParams.get('sortBy') || 'updatedAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const page = Number(searchParams.get('page') || 1);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await api.getTickets({
          search: search || undefined,
          status: status || undefined,
          priority: priority || undefined,
          assignedTo: assignedTo || undefined,
          sortBy,
          sortOrder,
          page,
          limit: 15,
        });
        setData(result);
      } catch (err) {
        addToast(formatApiError(err), 'error');
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, status, priority, assignedTo, sortBy, sortOrder, page, addToast]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      updateParam('sortOrder', sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      const next = new URLSearchParams(searchParams);
      next.set('sortBy', field);
      next.set('sortOrder', 'desc');
      next.delete('page');
      setSearchParams(next);
    }
  };

  const sortIcon = (field) => {
    if (sortBy !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="tickets-page">
      <div className="toolbar">
        <div className="filter-group">
          <select value={status} onChange={(e) => updateParam('status', e.target.value)} aria-label="Status">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={priority} onChange={(e) => updateParam('priority', e.target.value)} aria-label="Priority">
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select value={assignedTo} onChange={(e) => updateParam('assignedTo', e.target.value)} aria-label="Assignee">
            <option value="">All assignees</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <Link to="/tickets/new" className="btn btn-primary btn-sm">
          <IconPlus /> New Ticket
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading tickets..." />
      ) : data.tickets.length === 0 ? (
        <EmptyState
          title="No tickets found"
          description="Try adjusting your filters or create a new ticket."
          action={
            <Link to="/tickets/new" className="btn btn-primary">
              <IconPlus /> Create Ticket
            </Link>
          }
        />
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th className="sortable" onClick={() => toggleSort('title')}>
                    Summary {sortIcon('title')}
                  </th>
                  <th className="sortable" onClick={() => toggleSort('status')}>
                    Status {sortIcon('status')}
                  </th>
                  <th className="sortable" onClick={() => toggleSort('priority')}>
                    Priority {sortIcon('priority')}
                  </th>
                  <th>Assignee</th>
                  <th className="sortable" onClick={() => toggleSort('updatedAt')}>
                    Updated {sortIcon('updatedAt')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <Link to={`/tickets/${ticket.id}`} className="ticket-key">
                        {ticketKey(ticket.id)}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/tickets/${ticket.id}`} className="ticket-title">
                        {ticket.title}
                      </Link>
                    </td>
                    <td><StatusBadge status={ticket.status} size="sm" /></td>
                    <td><PriorityBadge priority={ticket.priority} /></td>
                    <td>
                      {ticket.assigneeName ? (
                        <span className="assignee-cell">
                          <Avatar name={ticket.assigneeName} size="xs" />
                          {ticket.assigneeName}
                        </span>
                      ) : (
                        <span className="muted">Unassigned</span>
                      )}
                    </td>
                    <td className="muted">{formatDate(ticket.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={(p) => updateParam('page', String(p))} />
          <p className="results-count">{data.total} ticket{data.total !== 1 ? 's' : ''} found</p>
        </>
      )}
    </div>
  );
}
