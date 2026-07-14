import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, formatApiError } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { PRIORITIES } from '../constants.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import Avatar from '../components/Avatar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { formatDate, ticketKey } from '../utils/format.js';
import { IconComment } from '../components/Icons.jsx';

export default function TicketDetail() {
  const { id } = useParams();
  const { addToast } = useToast();
  const [ticket, setTicket] = useState(null);
  const [users, setUsers] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const data = await api.getTicket(id);
      setTicket(data);
      setEditForm({
        title: data.title,
        description: data.description,
        priority: data.priority,
        assignedTo: data.assignedTo ? String(data.assignedTo) : '',
      });
    } catch (err) {
      addToast(formatApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateTicket(id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        priority: editForm.priority,
        assignedTo: editForm.assignedTo ? Number(editForm.assignedTo) : null,
      });
      setTicket((prev) => ({ ...prev, ...updated, comments: prev.comments, allowedTransitions: prev.allowedTransitions }));
      setEditing(false);
      addToast('Ticket updated successfully', 'success');
    } catch (err) {
      addToast(formatApiError(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await api.updateStatus(id, newStatus);
      setTicket((prev) => ({
        ...prev,
        ...updated,
        comments: prev.comments,
      }));
      addToast(`Status changed to ${newStatus}`, 'success');
    } catch (err) {
      addToast(formatApiError(err), 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const newComment = await api.addComment(id, comment.trim());
      setTicket((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }));
      setComment('');
      addToast('Comment added', 'success');
    } catch (err) {
      addToast(formatApiError(err), 'error');
    }
  };

  if (loading) return <LoadingSpinner label="Loading ticket..." />;
  if (!ticket) {
    return (
      <div className="empty-state">
        <h3>Ticket not found</h3>
        <Link to="/tickets" className="btn btn-secondary">Back to tickets</Link>
      </div>
    );
  }

  return (
    <div className="ticket-detail">
      <div className="detail-breadcrumb">
        <Link to="/tickets">Tickets</Link>
        <span>/</span>
        <span>{ticketKey(ticket.id)}</span>
      </div>

      <div className="detail-layout">
        <main className="detail-main">
          <div className="detail-title-row">
            {editing ? (
              <input
                className="title-input"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
              />
            ) : (
              <h2>{ticket.title}</h2>
            )}
          <div className="detail-title-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (editing) {
                  setEditForm({
                    title: ticket.title,
                    description: ticket.description,
                    priority: ticket.priority,
                    assignedTo: ticket.assignedTo ? String(ticket.assignedTo) : '',
                  });
                  setEditing(false);
                } else {
                  setEditing(true);
                }
              }}
              disabled={saving}
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
            {editing && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
          </div>

          <section className="panel">
            <h3>Description</h3>
            {editing ? (
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                rows={8}
                className="description-textarea"
              />
            ) : (
              <div className="description-content">{ticket.description}</div>
            )}
          </section>

          <section className="panel">
            <h3>
              <IconComment /> Activity
            </h3>
            <div className="activity-feed">
              {(ticket.comments || []).length === 0 ? (
                <p className="muted">No comments yet. Be the first to comment.</p>
              ) : (
                ticket.comments.map((c) => (
                  <div key={c.id} className="activity-item">
                    <Avatar name={c.authorName} size="sm" />
                    <div className="activity-body">
                      <div className="activity-header">
                        <strong>{c.authorName}</strong>
                        <span className="muted">{formatDate(c.createdAt)}</span>
                      </div>
                      <p>{c.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={!comment.trim()}>
                Add Comment
              </button>
            </form>
          </section>
        </main>

        <aside className="detail-sidebar">
          <div className="sidebar-card">
            <h4>Status</h4>
            <StatusBadge status={ticket.status} />
            {ticket.allowedTransitions?.length > 0 && (
              <div className="transition-buttons">
                {ticket.allowedTransitions.map((next) => (
                  <button
                    key={next}
                    type="button"
                    className="btn btn-outline btn-sm btn-block"
                    onClick={() => handleStatusChange(next)}
                  >
                    → {next}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sidebar-card">
            <h4>Details</h4>
            <dl className="detail-fields">
              <dt>Priority</dt>
              <dd>
                {editing ? (
                  <select name="priority" value={editForm.priority} onChange={handleEditChange}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                ) : (
                  <PriorityBadge priority={ticket.priority} />
                )}
              </dd>

              <dt>Assignee</dt>
              <dd>
                {editing ? (
                  <select name="assignedTo" value={editForm.assignedTo} onChange={handleEditChange}>
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                ) : ticket.assigneeName ? (
                  <span className="assignee-cell">
                    <Avatar name={ticket.assigneeName} size="xs" />
                    {ticket.assigneeName}
                  </span>
                ) : (
                  <span className="muted">Unassigned</span>
                )}
              </dd>

              <dt>Reporter</dt>
              <dd>
                <span className="assignee-cell">
                  <Avatar name={ticket.creatorName} size="xs" />
                  {ticket.creatorName}
                </span>
              </dd>

              <dt>Created</dt>
              <dd className="muted">{formatDate(ticket.createdAt)}</dd>

              <dt>Updated</dt>
              <dd className="muted">{formatDate(ticket.updatedAt)}</dd>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
