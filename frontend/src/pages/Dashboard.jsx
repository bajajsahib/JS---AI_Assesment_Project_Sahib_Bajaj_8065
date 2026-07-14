import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatApiError } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatRelative } from '../utils/format.js';
import { IconPlus } from '../components/Icons.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [statsData, ticketsData] = await Promise.all([
          api.getTicketStats(),
          api.getTickets({ limit: 5, sortBy: 'updatedAt', sortOrder: 'desc' }),
        ]);
        setStats(statsData);
        setRecent(ticketsData.tickets);
      } catch (err) {
        addToast(formatApiError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [addToast]);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;

  const cards = [
    { label: 'Total Tickets', value: stats?.total || 0, color: 'blue' },
    { label: 'Open / In Progress', value: stats?.openCount || 0, color: 'yellow' },
    { label: 'Resolved / Closed', value: stats?.resolvedCount || 0, color: 'green' },
    { label: 'Critical', value: stats?.byPriority?.Critical || 0, color: 'red' },
  ];

  return (
    <div className="dashboard">
      <div className="stat-grid">
        {cards.map((card) => (
          <div key={card.label} className={`stat-card stat-${card.color}`}>
            <span className="stat-value">{card.value}</span>
            <span className="stat-label">{card.label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Status Overview</h2>
          </div>
          <div className="status-breakdown">
            {Object.entries(stats?.byStatus || {}).map(([status, count]) => (
              <div key={status} className="breakdown-row">
                <StatusBadge status={status} />
                <div className="breakdown-bar-wrap">
                  <div
                    className="breakdown-bar"
                    style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="breakdown-count">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Recent Activity</h2>
            <Link to="/tickets" className="link-subtle">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="muted">No tickets yet.</p>
          ) : (
            <ul className="recent-list">
              {recent.map((t) => (
                <li key={t.id}>
                  <Link to={`/tickets/${t.id}`} className="recent-item">
                    <div>
                      <span className="recent-key">TICKET-{t.id}</span>
                      <span className="recent-title">{t.title}</span>
                    </div>
                    <div className="recent-meta">
                      <StatusBadge status={t.status} size="sm" />
                      <span>{formatRelative(t.updatedAt)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="quick-actions">
        <Link to="/tickets/new" className="btn btn-primary">
          <IconPlus /> Create New Ticket
        </Link>
        <Link to="/board" className="btn btn-secondary">
          Open Board View
        </Link>
      </div>
    </div>
  );
}
