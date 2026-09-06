export const QuantitySelector = ({ value, onChange, max = 99, min = 1, small = false }) => {
  const clamp = (v) => Math.max(min, Math.min(max, v));
  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 ${
        small ? 'h-8' : 'h-10'
      }`}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        className="flex h-full items-center justify-center px-3 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        −
      </button>
      <span className={`min-w-[2.5rem] text-center font-semibold ${small ? 'text-sm' : 'text-base'}`}>
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        className="flex h-full items-center justify-center px-3 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        +
      </button>
    </div>
  );
};