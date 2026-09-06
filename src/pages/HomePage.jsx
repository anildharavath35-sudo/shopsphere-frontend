import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../services/productService';
import { ProductGrid } from '../components/product/ProductGrid';
import { SectionHeader, SectionLoading } from '../components/product/Sections';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatINR } from '../utils/currency';
import { ArrowRight, TruckIcon, RefreshIcon, BankIcon } from '../components/common/Icons';
import { EmptyState } from '../components/common/EmptyState';

const RECENT_KEY = 'ss_recently_viewed';
export const saveRecentlyViewed = (product) => {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    const next = [product, ...list.filter((p) => p._id !== product._id)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
};

export default function HomePage() {
  useDocumentTitle('');
  const [state, setState] = useState({ featured: [], bestsellers: [], newArrivals: [], popular: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'));
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [featured, bestsellers, newArrivals, popular, cats] = await Promise.all([
          productService.getProducts({ featured: 'true', limit: 8 }),
          productService.getProducts({ bestseller: 'true', limit: 8 }),
          productService.getProducts({ sort: 'newest', limit: 8 }),
          productService.getProducts({ sort: 'popularity', limit: 8 }),
          categoryService.getCategories(),
        ]);
        if (!mounted) return;
        setState({
          featured: featured.data.products,
          bestsellers: bestsellers.data.products,
          newArrivals: newArrivals.data.products,
          popular: popular.data.products,
          categories: cats.data.categories,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const heroProduct = state.featured[0];

  return (
    <div className="space-y-14">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 text-white">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 right-32 h-72 w-72 rounded-full bg-accent-500/20 blur-2xl" />
        <div className="container-shop grid items-center gap-8 py-14 lg:grid-cols-2 lg:py-20">
          <div className="relative z-10">
            <span className="badge bg-white/15 text-white backdrop-blur">🛍️ New Season, New Deals</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Shop the best of <span className="text-accent-400">everything</span> you love
            </h1>
            <p className="mt-4 max-w-lg text-brand-100">
              Millions of products across electronics, fashion, home and more — at prices that make sense. Delivered fast, across India.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/products" className="btn-accent btn-lg">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/products?sort=bestseller" className="btn-lg border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                Best Sellers
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-sm text-brand-100">
              <span className="flex items-center gap-2"><TruckIcon size={18} /> Free delivery</span>
              <span className="flex items-center gap-2"><RefreshIcon size={18} /> 7-day returns</span>
              <span className="flex items-center gap-2"><BankIcon size={18} /> Secure payments</span>
            </div>
          </div>

          {heroProduct && (
            <Link
              to={`/product/${heroProduct.slug || heroProduct._id}`}
              className="group relative z-10 mx-auto lg:mx-0"
            >
              <div className="relative w-64 overflow-hidden rounded-3xl border-4 border-white/20 bg-white/10 shadow-2xl backdrop-blur sm:w-80">
                <img src={heroProduct.thumbnail || heroProduct.images?.[0]} alt={heroProduct.name} className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-3 py-2 text-slate-900 backdrop-blur dark:bg-slate-900/90 dark:text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                    Deal of the day
                  </p>
                  <p className="text-lg font-bold">{formatINR(heroProduct.price)}</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="container-shop">
        <SectionHeader title="Popular Categories" to="/products" linkLabel="All categories" />
        {loading ? (
          <SectionLoading cols={5} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {state.categories.slice(0, 10).map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${c._id}`}
                className="group card overflow-hidden transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={c.image || `https://picsum.photos/seed/${c.slug}/400/300`}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <p className="truncate px-3 py-2.5 text-center text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {c.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ================= FEATURED ================= */}
      <section className="container-shop">
        <SectionHeader title="Featured Products" to="/products?featured=true" linkLabel="View all" />
        <ProductGrid products={state.featured} loading={loading} />
      </section>

      {/* ================= BESTSELLERS ================= */}
      {!loading && state.bestsellers.length > 0 && (
        <section className="bg-gradient-to-r from-slate-100 to-slate-50 py-12 dark:from-slate-900 dark:to-slate-950">
          <div className="container-shop">
            <SectionHeader title="Best Sellers" to="/products?sort=popularity" linkLabel="View all" />
            <ProductGrid products={state.bestsellers} loading={loading} />
          </div>
        </section>
      )}

      {/* ================= DISCOUNT BANNER ================= */}
      <section className="container-shop">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-accent-500 px-6 py-10 text-white shadow-lg sm:px-10">
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-xl" />
          <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-rose-100">Limited time</p>
              <h2 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">Up to 30% OFF on top brands</h2>
              <p className="mt-1 text-rose-100">Electronics · Fashion · Home essentials</p>
            </div>
            <Link to="/products?sort=price_asc" className="btn bg-white text-rose-600 hover:bg-rose-50">
              Grab the deals <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= NEW ARRIVALS ================= */}
      <section className="container-shop">
        <SectionHeader title="New Arrivals" to="/products?sort=newest" linkLabel="View all" />
        <ProductGrid products={state.newArrivals} loading={loading} />
      </section>

      {/* ================= RECENTLY VIEWED ================= */}
      {!loading && recent.length > 0 && (
        <section className="container-shop">
          <SectionHeader title="Recently Viewed" to="/products" linkLabel="View all" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
            {recent.map((p) => (
              <Link key={p._id} to={`/product/${p.slug || p._id}`} className="card group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-card-hover">
                <div className="aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={p.thumbnail || p.images?.[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-2.5">
                  <p className="clamp-1 text-xs font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
                  <p className="mt-0.5 text-sm font-bold text-brand-600 dark:text-brand-300">{formatINR(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ================= RECOMMENDED ================= */}
      <section className="container-shop">
        <SectionHeader title="Recommended For You" />
        <ProductGrid products={state.popular} loading={loading} />
      </section>

      {!loading && state.popular.length === 0 && (
        <div className="container-shop">
          <EmptyState icon="🛒" title="No products yet" description="Products from the database will appear here once seeded." />
        </div>
      )}
    </div>
  );
}