import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { EmptyState } from '../components/common/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageLoader } from '../components/common/Spinner';

export default function CartPage() {
  useDocumentTitle('Shopping Cart');
  const { items, loaded, loading, totalQuantity } = useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  if (loading && !loaded) return <PageLoader text="Loading your cart…" />;

  const goCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="container-shop py-8">
      <h1 className="section-title mb-6">
        Shopping Cart{' '}
        <span className="text-base font-medium text-slate-400">
          ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
        </span>
      </h1>

      {items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our best sellers and fill it up!"
          action={<Link to="/products" className="btn-primary">Start Shopping</Link>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem key={item.product._id} item={item} />
            ))}
            <div className="flex justify-end">
              <button className="btn-outline btn-sm" onClick={() => navigate('/products')}>
                ← Continue shopping
              </button>
            </div>
          </div>
          <div>
            <CartSummary
              action={
                <button className="btn-primary btn-block btn-lg" onClick={goCheckout}>
                  Proceed to Checkout →
                </button>
              }
            />
            {!isAuthenticated && (
              <p className="mt-3 text-center text-xs text-slate-400">
                You'll be asked to log in before checkout.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}