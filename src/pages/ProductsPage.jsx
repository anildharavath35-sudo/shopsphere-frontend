import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productService, categoryService } from '../services/productService';
import { FilterSidebar } from '../components/product/FilterSidebar';
import { ProductGrid } from '../components/product/ProductGrid';
import { Pagination } from '../components/common/Pagination';
import { ErrorState } from '../components/common/EmptyState';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function ProductsPage() {
  useDocumentTitle('All Products');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const initialCategory = query.category || '';
  const [filters, setFiltersState] = useState({
    category: initialCategory,
    brand: query.brand ? query.brand.split(',') : [],
    minPrice: query.minPrice || '',
    maxPrice: query.maxPrice || '',
    minRating: query.minRating || '',
    inStock: query.inStock || '',
    search: query.search || '',
    sort: query.sort || 'default',
    featured: query.featured || '',
  });

  const [data, setData] = useState({ products: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 }, brands: [] });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [applied, setApplied] = useState({});

  // keep filters.category in sync with the URL when navigating from the navbar
  useEffect(() => {
    if (query.category && query.category !== filters.category) {
      setFiltersState((f) => ({ ...f, category: query.category }));
    }
  }, [query.category]);

  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    categoryService.getCategories().then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  // build applied filters (paged/stable)
  useEffect(() => {
    const next = {
      category: filters.category || undefined,
      brand: filters.brand.length ? filters.brand.join(',') : undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      minRating: filters.minRating || undefined,
      inStock: filters.inStock === 'true' ? 'true' : undefined,
      featured: filters.featured || undefined,
      search: debouncedSearch || undefined,
      sort: filters.sort !== 'default' ? filters.sort : undefined,
    };
    setApplied(next);
  }, [filters, debouncedSearch]);

  // fetch on applied-filter change (page resets to 1)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    productService
      .getProducts({ ...applied, page: query.page || 1 })
      .then((res) => {
        if (!mounted) return;
        setData(res.data);
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [applied, query.page]);

  const setFilters = (patch) => {
    setFiltersState((f) => ({ ...f, ...patch }));
  };

  // update URL as user interacts (for shareable links)
  const commitUrl = (f) => {
    const params = {};
    if (f.category) params.category = f.category;
    if (f.brand?.length) params.brand = f.brand.join(',');
    if (f.minPrice) params.minPrice = f.minPrice;
    if (f.maxPrice) params.maxPrice = f.maxPrice;
    if (f.minRating) params.minRating = f.minRating;
    if (f.inStock === 'true') params.inStock = 'true';
    if (f.featured) params.featured = f.featured;
    if (f.search) params.search = f.search;
    if (f.sort !== 'default') params.sort = f.sort;
    setSearchParams(params, { replace: true });
  };

  const applyAndFetch = (f) => {
    setFilters(f);
    commitUrl(f);
  };

  const onPageChange = (page) => {
    const params = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...params, page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const total = data.pagination.total;

  return (
    <div className="container-shop py-8">
      <div className="mb-6">
        <h1 className="section-title">
          {query.search ? `Results for “${query.search}”` : filters.category ? 'Shop by Category' : 'All Products'}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {loading ? 'Loading products…' : `${total} product${total === 1 ? '' : 's'} found`}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* desktop filters */}
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={applyAndFetch} categories={categories} brands={data.brands} />
        </div>

        <div>
          {/* toolbar */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <button className="btn-outline btn-sm lg:hidden" onClick={() => setMobileFilters(true)}>
              Filters
            </button>
            <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
              <input
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                placeholder="Search within results…"
                className="input"
              />
            </div>
            <div className="ml-auto">
              <select
                value={filters.sort}
                onChange={(e) => applyAndFetch({ ...filters, sort: e.target.value })}
                className="input w-auto"
                aria-label="Sort products"
              >
                <option value="default">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Best Rated</option>
                <option value="popularity">Most Popular</option>
                <option value="name_asc">Name A–Z</option>
              </select>
            </div>
          </div>

          {error ? (
            <ErrorState message={error} onRetry={() => navigate(0)} />
          ) : (
            <>
              <ProductGrid products={data.products} loading={loading} />
              {!loading && data.products.length > 0 && (
                <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={onPageChange} />
              )}
            </>
          )}
        </div>
      </div>

      {/* mobile filters drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] overflow-y-auto bg-white p-4 dark:bg-slate-900 animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Filters</h2>
              <button onClick={() => setMobileFilters(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <FilterSidebar filters={filters} onChange={applyAndFetch} categories={categories} brands={data.brands} />
            <button className="btn-primary btn-block mt-4" onClick={() => setMobileFilters(false)}>
              Show {total} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}