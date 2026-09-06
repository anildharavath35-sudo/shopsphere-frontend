export const EmptyState = ({ icon = '🗃️', title = 'Nothing here', description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
    <span className="text-4xl" role="img" aria-label="empty">
      {icon}
    </span>
    <h3 className="font-display text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
    {description && <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    {action}
  </div>
);

export const ErrorState = ({ title = 'Something went wrong', message, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-rose-200 bg-rose-50 py-16 text-center dark:border-rose-900 dark:bg-rose-950/40">
    <span className="text-4xl" role="img" aria-label="error">
      ⚠️
    </span>
    <h3 className="font-display text-lg font-bold text-rose-700 dark:text-rose-300">{title}</h3>
    {message && <p className="max-w-md text-sm text-rose-600/80 dark:text-rose-400/80">{message}</p>}
    {onRetry && (
      <button className="btn-outline btn-sm mt-2" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
);