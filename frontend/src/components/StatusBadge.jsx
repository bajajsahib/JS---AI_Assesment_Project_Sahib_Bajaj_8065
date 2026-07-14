import { STATUS_COLORS } from '../constants.js';

export default function StatusBadge({ status, size = 'md' }) {
  const color = STATUS_COLORS[status] || 'gray';
  return (
    <span className={`badge badge-status badge-${color} badge-${size}`}>
      {status}
    </span>
  );
}
