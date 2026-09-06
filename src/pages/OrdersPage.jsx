import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { OrderStatusBadge, PaymentBadge } from '../components/common/OrderStatus';
import { formatINR, formatDate } from '../utils/currency';
import { EmptyState } from '../components/common/EmptyState';
import { PageLoader } from '../components/common/Spinner';

export default function OrdersPage() {
  useDocumentTitle('My Orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderService.myOrders()
      .then((res) => setOrders(res.data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader text="Loading orders…" />;
  if (error) return <EmptyState icon="⚠️" title="Couldn't load orders" description={error} />;

  return (
    <div className="container-shop py-8">
      <h1 className="section-title mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders yet"
          description="When you place an order it will show up here with live tracking."
          action={<Link to="/products" className="btn-primary">Start Shopping</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const thumb = order.items[0]?.image;
            const rest = order.items.length - 1;
            return (
              <Link key={order._id} to={`/orders/${order._id}`} className="card block p-0 transition-shadow hover:shadow-lg">
                <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 px-5 py-3 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Order <span className="text-brand-600 dark:text-brand-400">#{order.orderId}</span>
                  </p>
                  <span className="text-xs text-slate-400">{formatDate(order.createdAt)}</span>
                  <span className="ml-auto flex items-center gap-2">
                    <PaymentBadge status={order.paymentStatus} />
                    <OrderStatusBadge status={order.orderStatus} />
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="flex items-center -space-x-3">
                    {order.items.slice(0, 3).map((it, i) => (
                      <img
                        key={i}
                        src={it.image}
                        alt={it.name}
                        className="h-14 w-14 rounded-xl border-2 border-white object-cover dark:border-slate-900"
                      />
                    ))}
                    {rest > 0 && (
                      <span className="grid h-14 w-14 place-items-center rounded-xl border-2 border-white bg-slate-100 text-xs font-bold text-slate-500 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-300">
                        +{rest}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="clamp-1 text-sm font-medium text-slate-700 dark:text-slate-200">{order.items[0]?.name}</p>
                    <p className="text-xs text-slate-400">{order.items.length} item(s) · {order.paymentMethod.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold">{formatINR(order.total)}</p>
                    <p className="text-xs text-slate-400">View details →</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}