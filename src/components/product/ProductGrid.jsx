import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

export const ProductGrid = ({ products, loading, emptyTitle = 'No products found', emptyText = 'Try adjusting your search or filters.' }) => {
  if (loading) return <ProductGridSkeleton count={8} />;
  if (!products || products.length === 0) {
    return <EmptyState icon="🛍️" title={emptyTitle} description={emptyText} />;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
};