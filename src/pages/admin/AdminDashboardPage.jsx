import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { adminService } from '../../services/adminService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { StatCard } from '../../components/admin/StatCard';
import { OrderStatusBadge, PaymentBadge } from '../../components/common/OrderStatus';
import { formatINR, formatDate } from '../../utils/currency';
import { ChartIcon, UsersIcon, PackageIcon, WalletIcon, TruckIcon, BellIcon, TagIcon } from '../../components/common/Icons';
import { PageLoader } from '../../components/common/Spinner';

const PIE_COLORS = ['#6366f1', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#ef4444'];
const TOOLTIP_STYLE = {
  background: '#0f172a',
  border: 'none',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '12px',
};

export default function AdminDashboardPage() {
  useDocumentTitle('Dashboard · Admin');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.dashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-rose-500">{error}</p>;
  if (!data) return <PageLoader text="Crunching dashboard numbers…" />;

  const { stats, charts, recentOrders } = data;

  return (
    <div className="space-y-6">
      {/* stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Revenue" value={formatINR(stats.totalRevenue)} icon={<WalletIcon size={22} />} accent="emerald" hint="Paid & non-cancelled" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={<PackageIcon size={22} />} accent="brand" hint={`${stats.pendingOrders} pending`} />
        <StatCard label="Active Products" value={stats.totalProducts} icon={<TagIcon size={22} />} accent="violet" hint={`${stats.lowStock.length} low stock`} />
        <StatCard label="Customers" value={stats.totalUsers} icon={<UsersIcon size={22} />} accent="amber" hint={`${stats.deliveredOrders} delivered`} />
      </div>

      {/* charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-1 font-display text-sm font-bold">Sales Overview</h3>
          <p className="mb-4 text-xs text-slate-400">Revenue · last 14 days</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={charts.salesOverview} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => formatINR(v)} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="mb-1 font-display text-sm font-bold">Revenue by Month</h3>
          <p className="mb-4 text-xs text-slate-400">Last 6 months (paid)</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={charts.revenueByMonth} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => formatINR(v)} />
              <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]} fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="mb-1 font-display text-sm font-bold">Orders by Status</h3>
          <p className="mb-2 text-xs text-slate-400">Distribution of the last{" "}
            {stats.totalOrders} orders</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={charts.ordersByStatus}
                dataKey="count"
                nameKey="status"
                innerRadius={48}
                outerRadius={85}
                paddingAngle={3}
              >
                {charts.ordersByStatus.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-sm font-bold">Best Sellers</h3>
          <p className="mb-4 text-xs text-slate-400">By units sold</p>
          <div className="space-y-3">
            {charts.bestSellers.slice(0, 5).map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={b.image} alt={b.name} className="h-10 w-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="clamp-1 text-xs font-semibold">{b.name}</p>
                  <p className="text-[10px] text-slate-400">{b.sold} sold · {formatINR(b.revenue)}</p>
                </div>
                <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
              </div>
            ))}
            {charts.bestSellers.length === 0 && <p className="text-xs text-slate-400">No sales yet.</p>}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <BellIcon size={16} className="text-orange-500" />
            <h3 className="font-display text-sm font-bold">Low Stock Alerts</h3>
          </div>
          <div className="space-y-3">
            {stats.lowStock.slice(0, 6).map((p) => (
              <div key={p._id} className="flex items-center gap-3">
                <img src={p.thumbnail || p.images?.[0]} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="clamp-1 text-xs font-semibold">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.brand}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.stock <= 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'}`}>
                  {p.stock} left
                </span>
              </div>
            ))}
            {stats.lowStock.length === 0 && <p className="text-xs text-slate-400">All stocked up! 🎉</p>}
          </div>
        </div>
      </div>

      {/* recent orders + link */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold">
            <TruckIcon size={16} className="text-brand-500" /> Recent Orders
          </h3>
          <Link to="/admin/orders" className="btn-outline btn-sm">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table-admin">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o._id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={() => (window.location.href = `/admin/orders/${o._id}`)}>
                  <td className="font-semibold text-brand-600 dark:text-brand-400">#{o.orderId}</td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td><OrderStatusBadge status={o.orderStatus} /></td>
                  <td><PaymentBadge status={o.paymentStatus} /></td>
                  <td className="text-right font-bold">{formatINR(o.total)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-sm text-slate-400">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex -mt-2 justify-end text-xs text-slate-400">
        <span className="flex items-center gap-1"><ChartIcon size={12} /> Dashboard refreshes on every load.</span>
      </div>
    </div>
  );
}