const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  shipped: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  out_for_delivery: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
};

const PAYMENT_STYLES = {
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  failed: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  refunded: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export const ORDER_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export const humanize = (s = '') => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const OrderStatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>{humanize(status)}</span>
);

export const PaymentBadge = ({ status }) => (
  <span className={`badge ${PAYMENT_STYLES[status] || PAYMENT_STYLES.pending}`}>{humanize(status)}</span>
);

export const StockBadge = ({ stock }) => {
  if (stock <= 0) return <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">Out of stock</span>;
  if (stock <= 5) return <span className="badge bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">Only {stock} left</span>;
  return <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">In stock</span>;
};