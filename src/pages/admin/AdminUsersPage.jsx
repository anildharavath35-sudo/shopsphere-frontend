import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { initials, formatDate } from '../../utils/currency';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';

const ROLE_FILTERS = ['all', 'customer', 'admin'];

export default function AdminUsersPage() {
  useDocumentTitle('Users · Admin');
  const toast = useUIStore((s) => s.toast);
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: 'all', search: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [busyId, setBusyId] = useState('');

  const load = (p = page, f = filters) => {
    setLoading(true);
    adminService.users({ page: p, limit: 15, ...f })
      .then((res) => { setUsers(res.data.users); setPagination(res.data.pagination); })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1, filters); }, []);

  const applyFilters = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setPage(1);
    load(1, next);
  };

  const toggleRole = async (u) => {
    setBusyId(u._id);
    try {
      await adminService.updateUserRole(u._id, u.role === 'admin' ? 'customer' : 'admin');
      toast(`Role updated`, 'success');
      load(page);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusyId('');
    }
  };

  const toggleBlock = async (u) => {
    setBusyId(u._id);
    try {
      await adminService.toggleUserBlock(u._id, !u.isBlocked);
      toast(u.isBlocked ? 'User unblocked' : 'User blocked', 'success');
      load(page);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold">Users</h1>

      <div className="flex flex-wrap items-center gap-3">
        <select className="input max-w-40" value={filters.role} onChange={(e) => applyFilters('role', e.target.value)}>
          {ROLE_FILTERS.map((r) => <option key={r} value={r}>{r === 'all' ? 'All roles' : r}</option>)}
        </select>
        <input className="input sm:max-w-xs flex-1" placeholder="Search by name / email / phone…" value={filters.search} onChange={(e) => applyFilters('search', e.target.value)} />
      </div>

      {loading ? (
        <PageLoader text="Loading users…" />
      ) : users.length === 0 ? (
        <EmptyState icon="👥" title="No users found" description="Try different filters." />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="table-admin">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Joined</th>
                  <th className="text-center">Role</th>
                  <th className="text-center">Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className={u.isBlocked ? 'opacity-60' : ''}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                          {initials(u.fullname)}
                        </span>
                        <div className="min-w-0">
                          <p className="clamp-1 max-w-52 text-sm font-semibold">{u.fullname}</p>
                          <p className="clamp-1 text-xs text-slate-400">{u.email} · {u.phone || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs">{formatDate(u.createdAt)}</td>
                    <td className="text-center">
                      <span className={`badge ${u.role === 'admin' ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-center text-xs">
                      {u.isBlocked ? <span className="font-bold text-rose-500">Blocked</span> : <span className="font-semibold text-emerald-500">Active</span>}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="btn-outline btn-sm" disabled={busyId === u._id} onClick={() => toggleRole(u)}>
                          {u.role === 'admin' ? 'Make customer' : 'Make admin'}
                        </button>
                        <button
                          className={`btn-outline btn-sm ${u.isBlocked ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400' : 'text-rose-600 hover:bg-rose-50 dark:text-rose-400'}`}
                          disabled={busyId === u._id || u.role === 'admin' || u._id === currentUser?._id}
                          title={u.role === 'admin' ? 'Cannot block an admin' : ''}
                          onClick={() => toggleBlock(u)}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
            <span className="text-xs text-slate-400">{pagination.total} user(s)</span>
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