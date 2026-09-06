import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PaymentBadge, OrderStatusBadge } from '../components/common/OrderStatus';
import { formatINR } from '../utils/currency';
import { PageLoader } from '../components/common/Spinner';

export default function OrderSuccessPage() {
  const { id } = useParams();
  useDocumentTitle('Order Confirmed');
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    orderService.getOrder(id)
      .then((res) => mounted && setOrder(res.data.order))
      .catch(() => mounted && navigate('/orders', { replace: true }))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id, navigate]);

  if (loading) return <PageLoader text="Confirming your order…" />;
  if (!order) return null;

  const delivery = order.paymentMethod === 'cod'
    ? `${formatINR(order.total)} payable on delivery`
    : (order.paymentStatus === 'paid' ? 'Payment received ✓' : 'Payment pending');

  return (
    <div className="container-shop py-16">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Thank you! 🎉</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Your order has been received and we're on it.
        </p>

        <div className="card mt-8 p-6 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <span className="text-sm text-slate-500 dark:text-slate-400">Order ID</span>
            <span className="font-bold">#{order.orderId}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 py-4 dark:border-slate-800">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
            <span className="font-extrabold">{formatINR(order.total)}</span>
          </div>
          <div className="border-b border-slate-100 py-4 dark:border-slate-800">
            <span className="block text-sm text-slate-500 dark:text-slate-400">Payment</span>
            <div className="mt-1.5 flex items-center gap-3">
              <PaymentBadge status={order.paymentStatus} />
              <span className="text-xs text-slate-500 dark:text-slate-400">{delivery}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
            <OrderStatusBadge status={order.orderStatus} />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={`/orders/${order._id}`} className="btn-primary">Track Order</Link>
          <Link to="/products" className="btn-outline">Continue Shopping</Link>
        </div>
        <p className="mt-6 text-xs text-slate-400">A confirmation email will be sent to your registered email address.</p>
      </div>
    </div>
  );
}