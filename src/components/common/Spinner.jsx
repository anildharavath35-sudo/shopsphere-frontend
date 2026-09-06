export const Spinner = ({ className = 'h-5 w-5', label }) => (
  <span role="status" aria-label={label || 'Loading'} className="inline-flex items-center gap-2">
    <svg className={`animate-spin ${className} text-brand-600`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    {label && <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>}
  </span>
);

export const PageLoader = ({ text = 'Loading…' }) => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  </div>
);