import { PRIORITY_COLORS } from '../constants.js';

export default function PriorityBadge({ priority, showIcon = true }) {
  const color = PRIORITY_COLORS[priority] || 'medium';
  return (
    <span className={`badge badge-priority badge-${color}`}>
      {showIcon && <span className="priority-dot" />}
      {priority}
    </span>
  );
}
