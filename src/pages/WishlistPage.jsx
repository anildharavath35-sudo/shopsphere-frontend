import { Link } from 'react-router-dom';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ProductCard } from '../components/product/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { PageLoader } from '../components/common/Spinner';

export default function WishlistPage() {
  useDocumentTitle('My Wishlist');
  const { products, loaded } = useWishlistStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!loaded) return <PageLoader text="Loading wishlist…" />;

  return (
    <div className="container-shop py-8">
      <h1 className="section-title mb-6">My Wishlist</h1>
      {!isAuthenticated && (
        <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
          You're browsing a temporary guest wishlist. <Link to="/login" className="font-semibold underline">Log in</Link> to keep it saved.
        </p>
      )}
      {products.length === 0 ? (
        <EmptyState
          icon="❤️"
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here for later."
          action={<Link to="/products" className="btn-primary">Explore Products</Link>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}