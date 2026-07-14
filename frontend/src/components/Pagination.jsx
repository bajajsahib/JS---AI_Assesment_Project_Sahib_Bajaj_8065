import { IconChevronLeft, IconChevronRight } from './Icons.jsx';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <IconChevronLeft /> Previous
      </button>
      <span className="pagination-info">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next <IconChevronRight />
      </button>
    </div>
  );
}
