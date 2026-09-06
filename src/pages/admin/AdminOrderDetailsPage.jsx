import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useUIStore } from '../../store/uiStore';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { OrderStatusBadge, PaymentBadge } from '../../components/common/OrderStatus';
import { OrderStatusTimeline } from '../../components/order/OrderStatusTimeline';
import { formatINR, formatDateTime } from '../../utils/currency';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { TruckIcon } from '../../components/common/Icons';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  useDocumentTitle('Order Details · Admin');
  const navigate = useNavigate();
  const toast = useUIStore((s) => s.toast);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [note, setNote] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  const load = () => {
    setLoading(true);
    adminService.getOrder(id)
      .then((res) => {
        setOrder(res.data.order);
        setStatus(res.data.order.orderStatus);
        setPaymentStatus(res.data.order.paymentStatus);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useDocumentTitle(order ? `Order ${order.orderId} · Admin` : 'Order Details · Admin');
  useEffect(() => { load(); }, [id]);

  const changeStatus = async (e) => {
    e.preventDefault();
    setSavingStatus(true);
    try {
      await adminService.updateOrderStatus(id, status, note.trim() || '');
      toast('Order status updated', 'success');
      setNote('');
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  const changePayment = async (e) => {
    e.preventDefault();
    setSavingPayment(true);
    try {
      await adminService.updatePaymentStatus(id, paymentStatus);
      toast('Payment status updated', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSavingPayment(false);
    }
  };

  if (loading) return <PageLoader text="Loading order…" />;
  if (error) return <EmptyState icon="⚠️" title="Order not found" description={error} action={<Link to="/admin/orders" className="btn-outline">← Back</Link>} />;
  if (!order) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button className="btn-outline btn-sm" onClick={() => navigate('/admin/orders')}><ArrowLeft size={14} /> All Orders</button>
          <h1 className="font-display text-xl font-bold">Order #{order.orderId}</h1>
        </div>
        <div className="flex items-center gap-2">
          <PaymentBadge status={order.paymentStatus} />
          <OrderStatusBadge status={order.orderStatus} />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold">Order Timeline</h2>
        <OrderStatusTimeline order={order} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-bold">Items</h2>
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800">
              <img src={it.image} alt={it.name} className="h-14 w-14 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="clamp-1 text-sm font-semibold">{it.name}</p>
                <p className="text-xs text-slate-400">Qty {it.quantity} × {formatINR(it.price)}</p>
              </div>
              <p className="text-sm font-bold">{formatINR(it.subtotal)}</p>
            </div>
          ))}
          <dl className="space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Discount</dt><dd className="text-emerald-600">−{formatINR(order.discount)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Delivery</dt><dd>{order.deliveryCharge ? formatINR(order.deliveryCharge) : 'FREE'}</dd></div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-extrabold dark:border-slate-800"><dt>Total</dt><dd>{formatINR(order.total)}</dd></div>
          </dl>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold"><TruckIcon size={16} className="text-brand-500" /> Shipping</h3>
            <p className="text-sm font-semibold">{order.shippingAddress.fullname}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {order.shippingAddress.address}{order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}
              <br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
            <p className="mt-2 text-xs text-slate-400">📞 {order.shippingAddress.phone}</p>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-display text-base font-bold">Customer</h3>
            {order.user ? (
              <>
                <p className="text-sm font-semibold">{order.user.fullname}</p>
                <p className="text-xs text-slate-400">{order.user.email} · {order.user.phone || ''}</p>
              </>
            ) : (
              <p className="text-xs text-slate-400">No user details</p>
            )}
            <p className="mt-3 text-xs text-slate-400">Placed {formatDateTime(order.createdAt)}</p>
          </div>

          <form onSubmit={changeStatus} className="card space-y-3 p-5">
            <h3 className="font-display text-base font-bold">Update Order Status</h3>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <input className="input" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="btn-primary btn-block" disabled={savingStatus}>{savingStatus ? 'Saving…' : 'Update Status'}</button>
          </form>

          <form onSubmit={changePayment} className="card space-y-3 p-5">
            <h3 className="font-display text-base font-bold">Payment Status</h3>
            <select className="input" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn-outline btn-block" disabled={savingPayment}>{savingPayment ? 'Saving…' : 'Update Payment'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}