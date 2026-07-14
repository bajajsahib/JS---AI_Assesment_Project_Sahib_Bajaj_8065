import { useTheme } from '../context/ThemeContext.jsx';
import { IconMoon, IconSearch, IconSun } from './Icons.jsx';
import Avatar from './Avatar.jsx';

export default function Header({ search, onSearchChange, title }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="top-header">
      <h1 className="page-title">{title}</h1>

      <div className="header-actions">
        <div className="search-box">
          <IconSearch />
          <input
            type="search"
            placeholder="Search tickets by keyword or ID..."
            value={search || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            disabled={!onSearchChange}
            aria-label="Global search"
          />
        </div>

        <button
          type="button"
          className="btn btn-icon"
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <IconSun /> : <IconMoon />}
        </button>

        <div className="user-menu">
          <Avatar name="Sahib Bajaj" size="sm" />
          <span className="user-name">Sahib Bajaj</span>
        </div>
      </div>
    </header>
  );
}
