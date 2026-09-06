import { Link } from 'react-router-dom';
import { SkeletonLine } from '../common/Skeleton';

export const SectionHeader = ({ title, subtitle, to, linkLabel }) => (
  <div className="mb-6 flex items-end justify-between gap-4">
    <div>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    {to && (
      <Link to={to} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
        {linkLabel || 'View all'} →
      </Link>
    )}
  </div>
);

export const SectionLoading = ({ cols = 4 }) => {
  const grid = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6' }[cols] || 'lg:grid-cols-4';
  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${grid}`}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton aspect-[4/3] rounded-none" />
          <div className="space-y-2 p-3">
            <SkeletonLine className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
};