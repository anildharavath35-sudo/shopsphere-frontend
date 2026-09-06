export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        className="btn-secondary btn-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Prev
      </button>
      {start > 1 && (
        <button className="btn-sm px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300" onClick={() => onPageChange(1)}>
          1
        </button>
      )}
      {start > 2 && <span className="px-1 text-slate-400">…</span>}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
            p === page
              ? 'bg-brand-600 text-white'
              : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          {p}
        </button>
      ))}
      {end < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
      {end < totalPages && (
        <button
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      )}
      <button
        className="btn-secondary btn-sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </nav>
  );
};