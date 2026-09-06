import { Price } from '../common/Price';

export const FilterSidebar = ({ filters, onChange, categories, brands, counts }) => {
  const set = (key, value) => onChange({ ...filters, [key]: value });
  const toggleIn = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    set(key, next);
  };

  return (
    <aside className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h3 className="font-display font-bold text-slate-800 dark:text-slate-100">Categories</h3>
        <div className="mt-3 space-y-1.5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="radio" checked={!filters.category} onChange={() => set('category', '')} className="accent-brand-600" />
            All categories
          </label>
          {categories.map((c) => (
            <label key={c._id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="radio" checked={filters.category === c._id} onChange={() => set('category', c._id)} className="accent-brand-600" />
              {c.name}
              {counts?.[c.name] !== undefined && <span className="text-xs text-slate-400">({counts[c.name]})</span>}
            </label>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-slate-800 dark:text-slate-100">Brand</h3>
          <div className="mt-3 flex max-h-48 flex-col gap-1.5 overflow-y-auto pr-1">
            {brands.map((b) => (
              <label key={b} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={(filters.brand || []).includes(b)} onChange={() => toggleIn('brand', b)} className="accent-brand-600" />
                {b}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-display font-bold text-slate-800 dark:text-slate-100">Price Range</h3>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => set('minPrice', e.target.value)}
            className="input px-2.5 py-1.5"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => set('maxPrice', e.target.value)}
            className="input px-2.5 py-1.5"
          />
        </div>
      </div>

      <div>
        <h3 className="font-display font-bold text-slate-800 dark:text-slate-100">Rating</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => set('minRating', filters.minRating === r ? '' : r)}
              className={`badge cursor-pointer px-3 py-1.5 ${filters.minRating === r ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
            >
              {r}★ & up
            </button>
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input type="checkbox" checked={filters.inStock === 'true'} onChange={() => set('inStock', filters.inStock === 'true' ? '' : 'true')} className="accent-brand-600" />
        In stock only
      </label>

      <button
        className="btn-outline btn-sm w-full"
        onClick={() => onChange({} )}
      >
        Reset filters
      </button>
    </aside>
  );
};