import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatApiError } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { PRIORITIES } from '../constants.js';

export default function CreateTicket() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    assignedTo: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Summary is required';
    if (!form.description.trim()) next.description = 'Description is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const ticket = await api.createTicket({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        assignedTo: form.assignedTo ? Number(form.assignedTo) : null,
      });
      addToast(`Ticket TICKET-${ticket.id} created successfully`, 'success');
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      addToast(formatApiError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page">
      <div className="panel form-panel">
        <h2>Create Issue</h2>
        <p className="form-subtitle">Fill in the details below to create a new support ticket.</p>

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-field">
            <label htmlFor="title">Summary *</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Brief description of the issue"
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              placeholder="Provide detailed information about the issue..."
              className={errors.description ? 'input-error' : ''}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="priority">Priority</label>
              <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="assignedTo">Assignee</label>
              <select id="assignedTo" name="assignedTo" value={form.assignedTo} onChange={handleChange}>
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
