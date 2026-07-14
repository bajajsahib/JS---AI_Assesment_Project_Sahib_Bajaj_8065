import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatApiError } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { BOARD_COLUMNS } from '../constants.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import Avatar from '../components/Avatar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { ticketKey } from '../utils/format.js';

export default function BoardView() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const result = await api.getTickets({ limit: 100, sortBy: 'updatedAt', sortOrder: 'desc' });
        setTickets(result.tickets);
      } catch (err) {
        addToast(formatApiError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [addToast]);

  if (loading) return <LoadingSpinner label="Loading board..." />;

  const grouped = BOARD_COLUMNS.reduce((acc, col) => {
    acc[col] = tickets.filter((t) => t.status === col);
    return acc;
  }, {});

  return (
    <div className="board-view">
      <div className="board-columns">
        {BOARD_COLUMNS.map((status) => (
          <div key={status} className="board-column">
            <div className="column-header">
              <StatusBadge status={status} size="sm" />
              <span className="column-count">{grouped[status].length}</span>
            </div>
            <div className="column-cards">
              {grouped[status].map((ticket) => (
                <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="board-card">
                  <div className="board-card-top">
                    <span className="ticket-key">{ticketKey(ticket.id)}</span>
                    <PriorityBadge priority={ticket.priority} showIcon={false} />
                  </div>
                  <h4>{ticket.title}</h4>
                  <div className="board-card-footer">
                    {ticket.assigneeName ? (
                      <Avatar name={ticket.assigneeName} size="xs" />
                    ) : (
                      <span className="muted">Unassigned</span>
                    )}
                  </div>
                </Link>
              ))}
              {grouped[status].length === 0 && (
                <div className="column-empty">No tickets</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
