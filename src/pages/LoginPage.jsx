import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useUIStore } from '../store/uiStore';
import { Spinner } from '../components/common/Spinner';

export default function LoginPage() {
  useDocumentTitle('Login');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useUIStore((s) => s.toast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const mergeCart = useCartStore.getState().guestItemsForSync();
      const data = await authService.login(form.email, form.password, mergeCart);
      useAuthStore.getState().setAuth(data.user, data.token);

      // sync stores to server (merge guest cart already handled by backend)
      await useCartStore.getState().hydrate(true);
      await useWishlistStore.getState().mergeGuestWishlist();

      const redirect = params.get('redirect') || '/';
      toast('Welcome back!', 'success');
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-8 text-center">
            <img src="/favicon.svg" alt="ShopSphere" className="mx-auto h-12 w-12" />
            <h1 className="mt-3 font-display text-2xl font-extrabold text-slate-900 dark:text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Log in to continue shopping</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">{error}</p>}

            <button className="btn-primary btn-block" disabled={loading}>
              {loading ? <Spinner label="Logging in…" /> : 'Login'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            Demo accounts
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <p>Customer: <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">arjun.mehta@example.com</code> / <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">Password@123</code></p>
            <p>Admin: <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">admin@shopsphere.com</code> / <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">Admin@123</code></p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}