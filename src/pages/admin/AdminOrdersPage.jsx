import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { OrderStatusBadge, PaymentBadge } from '../../components/common/OrderStatus';
import { formatINR, formatDate } from '../../utils/currency';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
const PAYMENT_FILTERS = ['all', 'pending', 'paid', 'failed', 'refunded'];

export default function AdminOrdersPage() {
  useDocumentTitle('Orders · Admin');
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', paymentStatus: 'all', search: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const load = (p = page, f = filters) => {
    setLoading(true);
    adminService.orders({ page: p, limit: 15, ...f })
      .then((res) => {
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1, filters); }, []);

  const applyFilters = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setPage(1);
    load(1, next);
  };

  const search = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, filters);
  };

  const clear = () => {
    const next = { status: 'all', paymentStatus: 'all', search: '' };
    setFilters(next);
    setPage(1);
    load(1, next);
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold">Orders</h1>

      <div className="flex flex-wrap items-center gap-3">
        <select className="input max-w-40" value={filters.status} onChange={(e) => applyFilters('status', e.target.value)}>
          {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="input max-w-40" value={filters.paymentStatus} onChange={(e) => applyFilters('paymentStatus', e.target.value)}>
          {PAYMENT_FILTERS.map((s) => <option key={s} value={s}>{s === 'all' ? 'All payments' : s}</option>)}
        </select>
        <form onSubmit={search} className="flex flex-1 gap-2 sm:max-w-xs">
          <input className="input" placeholder="Search by order # or user…" value={filters.search} onChange={(e) => applyFilters('search', e.target.value)} />
        </form>
        {Object.values(filters).some((v) => v !== '' && v !== 'all') && (
          <button className="btn-outline btn-sm" onClick={clear}>Clear</button>
        )}
      </div>

      {loading ? (
        <PageLoader text="Loading orders…" />
      ) : orders.length === 0 ? (
        <EmptyState icon="📋" title="No orders match" description="Try adjusting the filters." />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="table-admin">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={() => navigate(`/admin/orders/${o._id}`)}>
                    <td className="font-semibold text-brand-600 dark:text-brand-400">#{o.orderId}</td>
                    <td>
                      <p className="text-sm">{o.user?.fullname || '—'}</p>
                      <p className="text-[11px] text-slate-400">{o.user?.email}</p>
                    </td>
                    <td className="text-xs">{formatDate(o.createdAt)}</td>
                    <td className="text-center text-xs">{o.items.reduce((s, it) => s + it.quantity, 0)}</td>
                    <td><OrderStatusBadge status={o.orderStatus} /></td>
                    <td><PaymentBadge status={o.paymentStatus} /></td>
                    <td className="text-right font-bold">{formatINR(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
            <span className="text-xs text-slate-400">{pagination.total} order(s)</span>
            <div className="flex gap-2">
              <button className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => { setPage(page - 1); load(page - 1); }}>← Prev</button>
              <span className="self-center text-xs">Page {page} / {pagination.totalPages}</span>
              <button className="btn-secondary btn-sm" disabled={page >= pagination.totalPages} onClick={() => { setPage(page + 1); load(page + 1); }}>Next →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}