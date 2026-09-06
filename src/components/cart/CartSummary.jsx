import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/currency';
import { useCartStore } from '../../store/cartStore';

export const CartSummary = ({ action = null, note }) => {
  const totals = useCartStore((s) => s.totals);
  const items = useCartStore((s) => s.items);
  const leftForFree = totals.freeDeliveryThreshold - totals.subtotal;

  return (
    <div className="card sticky top-40 p-5">
      <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Price Details</h2>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between text-slate-600 dark:text-slate-300">
          <dt>
            Price ({items.length} {items.length === 1 ? 'item' : 'items'})
          </dt>
          <dd className="font-medium">{formatINR(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
          <dt>Discount</dt>
          <dd className="font-medium">− {formatINR(totals.discount)}</dd>
        </div>
        <div className="flex justify-between text-slate-600 dark:text-slate-300">
          <dt>Delivery charge</dt>
          <dd className="font-medium">{totals.deliveryCharge === 0 ? 'FREE' : formatINR(totals.deliveryCharge)}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-dashed border-slate-200 pt-3 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white">
          <dt>Total amount</dt>
          <dd>{formatINR(totals.total)}</dd>
        </div>
      </dl>

      {leftForFree > 0 && totals.subtotal > 0 && (
        <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          Add {formatINR(leftForFree)} more to get <b>FREE delivery</b> 🚚
        </p>
      )}

      {totals.subtotal >= totals.freeDeliveryThreshold && totals.subtotal > 0 && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          You've unlocked FREE delivery!
        </p>
      )}

      {note && <p className="mt-3 text-xs text-slate-400">{note}</p>}

      {action && <div className="mt-4">{action}</div>}

      {items.length > 0 && (
        <Link to="/products" className="mt-3 block text-center text-xs font-semibold text-brand-600 hover:underline">
          Continue shopping
        </Link>
      )}
    </div>
  );
};