export const StatCard = ({ label, value, icon, accent = 'brand', hint }) => {
  const accents = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300',
  };
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${accents[accent]}`}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{label}</p>
        {hint && <p className="truncate text-[10px] text-slate-400">{hint}</p>}
      </div>
    </div>
  );
};