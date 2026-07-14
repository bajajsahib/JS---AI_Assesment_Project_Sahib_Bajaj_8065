import { getInitials } from '../utils/format.js';

export default function Avatar({ name, size = 'md' }) {
  return (
    <span className={`avatar avatar-${size}`} title={name}>
      {getInitials(name)}
    </span>
  );
}
