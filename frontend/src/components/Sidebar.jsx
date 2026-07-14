import { NavLink } from 'react-router-dom';
import { IconBoard, IconDashboard, IconPlus, IconTickets } from './Icons.jsx';

const navItems = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/tickets', label: 'All Tickets', icon: IconTickets },
  { to: '/board', label: 'Board', icon: IconBoard },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">ST</div>
        <div>
          <div className="brand-name">SupportDesk</div>
          <div className="brand-tag">Ticket Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/tickets/new" className="btn btn-create">
          <IconPlus />
          Create Ticket
        </NavLink>
      </div>
    </aside>
  );
}
