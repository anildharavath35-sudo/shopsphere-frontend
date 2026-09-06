import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { formatINR } from '../../utils/currency';
import { QuantitySelector } from '../common/QuantitySelector';
import { TrashIcon } from '../common/Icons';
import { useState } from 'react';
import { ConfirmDialog } from '../common/Modal';

export const CartItem = ({ item }) => {
  const { product, quantity } = item;
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div className="card flex gap-4 p-4">
        <Link to={`/product/${product.slug || product._id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
          <img src={product.thumbnail || product.images?.[0]} alt={product.name} className="h-full w-full object-cover" />
        </Link>

        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link to={`/product/${product.slug || product._id}`} className="clamp-1 text-sm font-semibold text-slate-800 hover:text-brand-600 dark:text-slate-100">
                {product.name}
              </Link>
              <p className="mt-0.5 text-xs text-slate-400">{product.brand}</p>
            </div>
            <button
              onClick={() => setConfirmOpen(true)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
              aria-label="Remove item"
            >
              <TrashIcon size={17} />
            </button>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
            <QuantitySelector
              value={quantity}
              max={product.stock || 99}
              onChange={(q) => updateQuantity(product._id, q)}
              small
            />
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{formatINR(product.price * quantity)}</p>
              {product.mrp !== product.price && (
                <p className="text-xs text-slate-400 line-through">{formatINR(product.mrp * quantity)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Remove item?"
        message={`Remove "${product.name}" from your cart?`}
        confirmText="Remove"
        danger
        onConfirm={() => {
          removeItem(product._id);
          setConfirmOpen(false);
        }}
      />
    </>
  );
};