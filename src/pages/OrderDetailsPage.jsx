import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useUIStore } from '../store/uiStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { OrderStatusBadge, PaymentBadge } from '../components/common/OrderStatus';
import { OrderStatusTimeline } from '../components/order/OrderStatusTimeline';
import { ConfirmDialog } from '../components/common/Modal';
import { TruckIcon } from '../components/common/Icons';
import { formatINR, formatDateTime } from '../utils/currency';
import { PageLoader } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';

const CANCELABLE = ['pending', 'confirmed', 'processing'];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const toast = useUIStore((s) => s.toast);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    setLoading(true);
    orderService.getOrder(id)
      .then((res) => setOrder(res.data.order))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useDocumentTitle(order ? `Order ${order.orderId}` : 'Order');
  useEffect(load, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await orderService.cancelOrder(id, cancelReason.trim() || 'Cancelled by customer');
      toast('Order cancelled.', 'success');
      setShowCancel(false);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <PageLoader text="Loading order…" />;
  if (error) return <EmptyState icon="⚠️" title="Order not found" description={error} action={<Link to="/orders" className="btn-outline">← Back to orders</Link>} />;
  if (!order) return null;

  const canCancel = CANCELABLE.includes(order.orderStatus);

  return (
    <div className="container-shop py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title mb-0">Order #{order.orderId}</h1>
          <p className="mt-1 text-sm text-slate-400">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <PaymentBadge status={order.paymentStatus} />
          <OrderStatusBadge status={order.orderStatus} />
          {canCancel && (
            <button className="btn-outline btn-sm" onClick={() => setShowCancel(true)}>Cancel Order</button>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 font-display text-lg font-bold">Order Tracking</h2>
        <OrderStatusTimeline order={order} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-bold">Items</h2>
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800">
              <img src={it.image} alt={it.name} className="h-16 w-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="clamp-1 text-sm font-semibold">{it.name}</p>
                {it.brand && <p className="text-xs text-slate-400">{it.brand}</p>}
                <p className="text-xs text-slate-500 dark:text-slate-400">Qty: {it.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{formatINR(it.subtotal)}</p>
                {it.mrp > it.price && (
                  <p className="text-xs text-slate-400 line-through">{formatINR(it.mrp * it.quantity)}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold">
              <TruckIcon size={18} className="text-brand-500" /> Delivering to
            </h3>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{order.shippingAddress.fullname}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {order.shippingAddress.address}
              {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
            <p className="mt-2 text-xs text-slate-400">📞 {order.shippingAddress.phone}</p>
          </div>

          <div className="card p-6">
            <h3 className="mb-3 font-display text-base font-bold">Price Summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Discount</dt>
                <dd className="text-emerald-600 dark:text-emerald-400">−{formatINR(order.discount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Delivery</dt>
                <dd>{order.deliveryCharge ? formatINR(order.deliveryCharge) : <span className="font-semibold text-emerald-600">FREE</span>}</dd>
              </div>
              <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-base font-extrabold dark:border-slate-800">
                <dt>Total</dt><dd>{formatINR(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showCancel}
        onClose={() => setShowCancel(false)}
        title="Cancel this order?"
        confirmText="Yes, cancel order"
        onConfirm={handleCancel}
        loading={cancelling}
      >
        <label className="label" htmlFor="cancelReason">Reason (optional)</label>
        <select
          id="cancelReason"
          className="input"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        >
          <option value="">Select a reason…</option>
          <option>Changed my mind</option>
          <option>Found cheaper elsewhere</option>
          <option>Delivery date too long</option>
          <option>Ordered by mistake</option>
        </select>
        <p className="mt-3 text-xs text-slate-400">Reserved stock will be released back to inventory. This action cannot be undone.</p>
      </ConfirmDialog>
    </div>
  );
}