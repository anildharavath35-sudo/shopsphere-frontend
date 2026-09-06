import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ImageGallery } from '../components/product/ImageGallery';
import { QuantitySelector } from '../components/common/QuantitySelector';
import { RatingDisplay, StarInput } from '../components/common/Rating';
import { StockBadge } from '../components/common/OrderStatus';
import { ProductCard } from '../components/product/ProductCard';
import { PageLoader } from '../components/common/Spinner';
import { EmptyState, ErrorState } from '../components/common/EmptyState';
import { TruckIcon, ShieldIcon, RefreshIcon, HeartIcon, EditIcon, TrashIcon, CheckIcon, PackageIcon } from '../components/common/Icons';
import { formatINR, formatDate } from '../utils/currency';
import { saveRecentlyViewed } from './HomePage';
import { ConfirmDialog } from '../components/common/Modal';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted);
  const user = useAuthStore((s) => s.user);
  const toast = useUIStore((s) => s.toast);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadReviews = (page = 1) => {
    setReviewsLoading(true);
    productService
      .getProductReviews(id, page)
      .then((res) => {
        setReviews(res.data.reviews);
        setReviewTotal(res.data.pagination.total);
        setReviewPage(page);
        const mine = user ? res.data.reviews.find((r) => r.user?._id === user._id) : null;
        if (mine) {
          setMyReview(mine);
          setReviewForm({ rating: mine.rating, title: mine.title, comment: mine.comment });
        }
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    productService
      .getProduct(id)
      .then((res) => {
        if (!mounted) return;
        setData(res.data);
        saveRecentlyViewed({
          _id: res.data.product._id,
          slug: res.data.product.slug,
          name: res.data.product.name,
          price: res.data.product.price,
          thumbnail: res.data.product.thumbnail || res.data.product.images?.[0],
          images: res.data.product.images,
        });
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (data) loadReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.product?._id, user?._id]);

  useDocumentTitle(data?.product?.name || 'Product');

  if (loading) return <PageLoader text="Loading product…" />;
  if (error) {
    return (
      <div className="container-shop py-16">
        <ErrorState title="Product not found" message={error} onRetry={() => navigate(0)} />
      </div>
    );
  }

  const { product, related } = data || { product: {}, related: [] };
  const percent = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const isInWishlist = isWishlisted(product._id);

  const handleAdd = async (action = 'add') => {
    setAdding(true);
    const ok = await addItem(product, qty);
    setAdding(false);
    if (!ok) return;
    if (action === 'buy') navigate('/checkout');
  };

  const handleWish = () => toggleWish(product);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate(`/login?redirect=${encodeURIComponent(`/product/${id}`)}`);
    if (!reviewForm.rating) return toast('Please select a rating', 'error');
    setReviewSubmitting(true);
    try {
      if (myReview) {
        await reviewService.update(myReview._id, reviewForm);
        toast('Review updated', 'success');
      } else {
        await productService.addReview(product._id, reviewForm);
        toast('Review submitted — thank you!', 'success');
      }
      setShowForm(false);
      loadReviews(1);
      const fresh = await productService.getProduct(product._id);
      setData({ ...data, product: fresh.data.product });
    } catch (err) {
      toast(err.message || 'Could not submit review', 'error');
      if (err.code === 'PURCHASE_REQUIRED') toast('Reviews are only allowed for purchased products.', 'info');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReviewDelete = async () => {
    try {
      await reviewService.remove(deleteTarget._id);
      toast('Review deleted', 'success');
      setMyReview(null);
      loadReviews(1);
      const fresh = await productService.getProduct(product._id);
      setData({ ...data, product: fresh.data.product });
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const reviewsPerPage = 6;
  const reviewTotalPages = Math.ceil(reviewTotal / reviewsPerPage);

  return (
    <div className="container-shop py-8">
      {/* breadcrumb */}
      <nav className="mb-5 text-xs text-slate-400">
        <Link to="/" className="hover:text-brand-600">Home</Link> {' / '}
        <Link to={`/products?category=${product.category?._id}`} className="hover:text-brand-600">
          {product.category?.name || 'Products'}
        </Link>{' / '}
        <span className="text-slate-600 dark:text-slate-300">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* gallery */}
        <ImageGallery images={product.images} name={product.name} />

        {/* info */}
        <div>
          <p className="flex items-center gap-3 text-sm">
            <span className="font-semibold uppercase tracking-wide text-slate-400">{product.brand}</span>
            <StockBadge stock={product.stock} />
          </p>
          <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl dark:text-white">
            {product.name}
          </h1>
          <div className="mt-3">
            <RatingDisplay rating={product.rating} count={product.numReviews} />
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{formatINR(product.price)}</span>
              {product.mrp > product.price && (
                <>
                  <span className="mb-0.5 text-lg text-slate-400 line-through">{formatINR(product.mrp)}</span>
                  <span className="mb-1 badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{percent}% off</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">MRP inclusive of all taxes</p>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <QuantitySelector value={qty} max={Math.max(1, product.stock)} onChange={setQty} />
            <button onClick={() => handleWish} className={`btn-outline ${isInWishlist ? '!border-rose-400 !text-rose-500' : ''}`}>
              <HeartIcon size={17} filled={isInWishlist} />
              {isInWishlist ? 'Wishlisted' : 'Wishlist'}
            </button>
          </div>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            <button className="btn-primary btn-lg" disabled={adding || product.stock <= 0} onClick={() => handleAdd('add')}>
              {adding ? 'Adding…' : 'Add to Cart'}
            </button>
            <button
              className="btn-accent btn-lg"
              disabled={adding || product.stock <= 0}
              onClick={() => handleAdd('buy')}
            >
              {adding ? 'Adding…' : 'Buy Now'}
            </button>
          </div>

          {/* trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
              <TruckIcon size={18} className="mx-auto text-brand-500" />
              <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">Free delivery</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
              <RefreshIcon size={18} className="mx-auto text-brand-500" />
              <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">7-day returns</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
              <ShieldIcon size={18} className="mx-auto text-brand-500" />
              <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">Warranty</p>
            </div>
          </div>

          {/* spec preview */}
          {product.specifications?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-bold text-slate-800 dark:text-slate-100">Highlights</h3>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {product.specifications.slice(0, 6).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckIcon size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span><b className="font-semibold">{s.label}:</b> {s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-950/50 dark:text-brand-200">
            <PackageIcon size={18} className="mt-0.5 shrink-0" />
            <p><b>Delivery:</b> Usually delivered in 2–5 business days across India. Cash on Delivery available.</p>
          </div>
        </div>
      </div>

      {/* ---------- Tabs: description / specifications ---------- */}
      <div className="mt-12">
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {[
            { key: 'description', label: 'Description' },
            { key: 'specifications', label: 'Specifications' },
            { key: 'reviews', label: `Reviews (${reviewTotal || product.numReviews})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === t.key
                  ? 'border-brand-600 text-brand-700 dark:text-brand-300'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="max-w-3xl py-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <p>{product.description}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Return Policy</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  7-day easy return. Items must be unused, in original packaging with tags intact.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Warranty</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Standard manufacturer warranty applies. Support via the brand's service network.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="max-w-2xl py-6">
            <table className="w-full text-sm">
              <tbody>
                <Row label="Brand" value={product.brand} />
                <Row label="SKU" value={product.sku} />
                <Row label="Category" value={product.category?.name} />
                <Row label="MRP" value={formatINR(product.mrp)} />
                <Row label="Selling price" value={formatINR(product.price)} />
                {product.specifications?.map((s, i) => (
                  <Row key={i} label={s.label} value={s.value} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="grid gap-8 py-6 lg:grid-cols-[1fr_360px]">
            {/* review list */}
            <div>
              {reviewsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full" />)}
                </div>
              ) : reviews.length === 0 ? (
                <EmptyState icon="⭐" title="No reviews yet" description="Be the first to share your experience." />
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            {r.user?.fullname?.[0]?.toUpperCase() || 'U'}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {r.user?.fullname}
                              {r.user?._id === user?._id && <span className="ml-2 badge bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">You</span>}
                            </p>
                            <div className="flex items-center gap-2">
                              <RatingDisplay rating={r.rating} />
                              <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        {r.user?._id === user?._id && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => { setMyReview(r); setReviewForm({ rating: r.rating, title: r.title, comment: r.comment }); setShowForm(true); }}
                              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                              aria-label="Edit review"
                            >
                              <EditIcon size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(r)}
                              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
                              aria-label="Delete review"
                            >
                              <TrashIcon size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                      {r.title && <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">{r.title}</p>}
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {reviewTotalPages > 1 && (
                <div className="mt-5 flex items-center justify-center gap-2">
                  <button className="btn-outline btn-sm" disabled={reviewPage <= 1} onClick={() => loadReviews(reviewPage - 1)}>← Prev</button>
                  <span className="text-sm text-slate-500">Page {reviewPage} of {reviewTotalPages}</span>
                  <button className="btn-outline btn-sm" disabled={reviewPage >= reviewTotalPages} onClick={() => loadReviews(reviewPage + 1)}>Next →</button>
                </div>
              )}
            </div>

            {/* write review */}
            <div className="card sticky top-28 h-fit p-5">
              <h3 className="font-display text-lg font-bold">
                {myReview ? 'Your Review' : 'Write a Review'}
              </h3>
              {!showForm ? (
                <div className="mt-3">
                  {myReview && !showForm ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      You rated this {myReview.rating}★. Click below to edit or delete.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Bought this? Share your experience with other shoppers.
                    </p>
                  )}
                  <button className="btn-primary btn-block mt-4" onClick={() => { setShowForm(true); if (!myReview) setReviewForm({ rating: 0, title: '', comment: '' }); }}>
                    {myReview ? 'Edit your review' : 'Write a review'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="label">Your rating</label>
                    <StarInput value={reviewForm.rating} onChange={(rating) => setReviewForm((f) => ({ ...f, rating }))} />
                  </div>
                  <div>
                    <label className="label">Review title (optional)</label>
                    <input className="input" value={reviewForm.title} maxLength={120} onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))} placeholder="Great value for money" />
                  </div>
                  <div>
                    <label className="label">Review</label>
                    <textarea
                      className="input min-h-24"
                      rows={4}
                      value={reviewForm.comment}
                      maxLength={1000}
                      onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                      placeholder="What did you like or dislike?"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary flex-1" disabled={reviewSubmitting}>
                      {reviewSubmitting ? 'Submitting…' : myReview ? 'Update Review' : 'Submit Review'}
                    </button>
                    <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                  </div>
                </form>
              )}
              {!user && (
                <p className="mt-4 text-xs text-slate-400">
                  <Link to={`/login?redirect=/product/${id}`} className="font-semibold text-brand-600 hover:underline">Log in</Link> to write a review.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title mb-6">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete review?"
        message="This action cannot be undone."
        confirmText="Delete"
        danger
        onConfirm={handleReviewDelete}
      />
    </div>
  );
}

const Row = ({ label, value }) => (
  <tr className="border-b border-slate-100 dark:border-slate-800">
    <td className="py-2.5 pr-4 font-medium text-slate-500 dark:text-slate-400">{label}</td>
    <td className="py-2.5 text-slate-800 dark:text-slate-100">{value || '—'}</td>
  </tr>
);