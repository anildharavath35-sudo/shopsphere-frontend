export const SkeletonLine = ({ className = 'h-4 w-full' }) => <div className={`skeleton ${className}`} />;

export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="skeleton aspect-square rounded-none" />
    <div className="space-y-3 p-4">
      <SkeletonLine className="h-3 w-2/3" />
      <SkeletonLine className="h-3 w-1/2" />
      <div className="flex items-center justify-between">
        <SkeletonLine className="h-5 w-1/3" />
        <SkeletonLine className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const TextRowsSkeleton = ({ rows = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonLine key={i} className={`h-4 ${i === rows - 1 ? 'w-1/2' : 'w-full'}`} />
    ))}
  </div>
);