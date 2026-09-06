import { formatINR, discountPercent } from '../../utils/currency';

export const DiscountBadge = ({ percent, size = 'text-xs' }) => {
  if (!percent) return null;
  return (
    <span className={`badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 ${size}`}>
      {percent}% off
    </span>
  );
};

export const Price = ({ product, size = 'md', showDiscount = true, showMrp = true }) => {
  const percent = discountPercent(product.mrp, product.price);
  return (
    <div className="flex items-center gap-2">
      <span
        className={`font-bold text-slate-900 dark:text-white ${
          size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base'
        }`}
      >
        {formatINR(product.price)}
      </span>
      {showMrp && product.mrp > product.price && (
        <span className={`text-slate-400 line-through ${size === 'lg' ? 'text-base' : 'text-xs'}`}>
          {formatINR(product.mrp)}
        </span>
      )}
      {showDiscount && <DiscountBadge percent={percent} />}
    </div>
  );
};