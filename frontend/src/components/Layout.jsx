import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/tickets': 'All Tickets',
  '/board': 'Board',
  '/tickets/new': 'Create Ticket',
};

function getTitle(pathname) {
  if (pathname.startsWith('/tickets/') && pathname !== '/tickets/new') {
    return 'Ticket Details';
  }
  return PAGE_TITLES[pathname] || 'SupportDesk';
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const isTicketsPage = location.pathname === '/tickets';
  const headerSearch = isTicketsPage ? (searchParams.get('search') || '') : search;

  useEffect(() => {
    if (!isTicketsPage) setSearch('');
  }, [location.pathname, isTicketsPage]);

  const handleSearch = (value) => {
    if (isTicketsPage) {
      const next = new URLSearchParams(searchParams);
      if (value) next.set('search', value);
      else next.delete('search');
      next.delete('page');
      navigate(`/tickets?${next.toString()}`);
    } else {
      setSearch(value);
      if (value) {
        navigate(`/tickets?search=${encodeURIComponent(value)}`);
      }
    }
  };

  const showGlobalSearch = location.pathname !== '/tickets/new' && !location.pathname.match(/^\/tickets\/\d+/);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-panel">
        <Header
          title={getTitle(location.pathname)}
          search={showGlobalSearch ? headerSearch : ''}
          onSearchChange={showGlobalSearch ? handleSearch : undefined}
        />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
