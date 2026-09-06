import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { formatINR, discountPercent } from '../../utils/currency';
import { CartIcon, HeartIcon } from '../common/Icons';
import { RatingDisplay } from '../common/Rating';
import { useState } from 'react';

export const ProductCard = ({ product }) => {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product._id));
  const [adding, setAdding] = useState(false);

  const percent = discountPercent(product.mrp, product.price);
  const out = product.stock <= 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    const ok = await addItem(product, 1);
    setAdding(false);
    if (!ok) return;
  };

  const handleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWish(product);
  };

  return (
    <Link
      to={`/product/${product.slug || product._id}`}
      className="group card relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={product.thumbnail || product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.bestseller && (
            <span className="badge bg-brand-600 text-white shadow-sm">Bestseller</span>
          )}
          {percent > 0 && (
            <span className="badge bg-rose-500 text-white shadow-sm">{percent}% off</span>
          )}
        </div>
        <button
          onClick={handleWish}
          aria-label="Toggle wishlist"
          className={`absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all hover:scale-110 dark:bg-slate-900/80 ${
            isWishlisted ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
          }`}
        >
          <HeartIcon size={16} filled={isWishlisted} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-xs font-medium text-slate-400">{product.brand}</p>
        <h3 className="clamp-2 mt-0.5 text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100">
          {product.name}
        </h3>
        <div className="mt-1.5">
          <RatingDisplay rating={product.rating} count={product.numReviews} />
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-base font-bold text-slate-900 dark:text-white">{formatINR(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-slate-400 line-through">{formatINR(product.mrp)}</span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleAdd}
            disabled={out || adding}
            className={`${out ? 'btn-secondary' : 'btn-primary'} btn-sm flex-1`}
          >
            {adding ? 'Adding…' : out ? 'Out of stock' : (
              <>
                <CartIcon size={15} /> Add to cart
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};