import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useDebounce } from '../../hooks/useDebounce';
import { formatINR } from '../../utils/currency';
import { SearchIcon, XIcon } from '../common/Icons';

const RECENT_KEY = 'ss_recent_searches';
const loadRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
};
const saveRecent = (q) => {
  const list = [q, ...loadRecent().filter((s) => s !== q)].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
};

export const SearchBar = ({ compact = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query, 350);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (debounced.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    productService
      .getProducts({ search: debounced.trim(), limit: 6 })
      .then((res) => {
        if (!cancelled) setSuggestions(res.data.products);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const submit = (value) => {
    const q = (value ?? query).trim();
    if (!q) return;
    saveRecent(q);
    setOpen(false);
    navigate(`/products?search=${encodeURIComponent(q)}`);
  };

  const recent = loadRecent();

  return (
    <div ref={wrapperRef} className={`relative w-full ${compact ? '' : 'max-w-xl'}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative"
      >
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search products, brands and more…"
          className="input rounded-full pl-10 pr-10"
        />
        <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <XIcon size={16} />
          </button>
        )}
      </form>

      {open && (query.trim().length < 2 || suggestions.length > 0 || recent.length > 0) && (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 animate-scale-in">
          {debounced.trim().length >= 2 && (
            <div className="max-h-80 overflow-y-auto">
              <p className="flex items-center gap-2 px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {loading ? 'Searching…' : 'Suggestions'}
              </p>
              {suggestions.map((p) => (
                <Link
                  key={p._id}
                  to={`/product/${p.slug || p._id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <img src={p.thumbnail} alt={p.name} className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{p.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {p.brand} · {formatINR(p.price)}
                    </p>
                  </div>
                  <SearchIcon size={14} className="text-slate-300" />
                </Link>
              ))}
              {suggestions.length === 0 && !loading && (
                <p className="px-4 py-3 text-sm text-slate-400">No products found for “{debounced}”.</p>
              )}
            </div>
          )}
          {query.trim().length < 2 && recent.length > 0 && (
            <div>
              <p className="flex items-center justify-between px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Recent searches
                <button
                  onClick={() => {
                    localStorage.removeItem(RECENT_KEY);
                    setOpen(false);
                  }}
                  className="font-normal normal-case text-brand-500 hover:underline"
                >
                  Clear
                </button>
              </p>
              {recent.map((r) => (
                <button
                  key={r}
                  onClick={() => submit(r)}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};