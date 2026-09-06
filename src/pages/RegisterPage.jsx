import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useUIStore } from '../store/uiStore';
import { Spinner } from '../components/common/Spinner';

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function RegisterPage() {
  useDocumentTitle('Create Account');
  const [form, setForm] = useState({ fullname: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useUIStore((s) => s.toast);

  const validate = () => {
    const e = {};
    if (!form.fullname.trim()) e.fullname = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!/^[0-9+\-\s()]{10,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    if (!PASSWORD_RULE.test(form.password)) e.password = 'Password: 8+ chars, one number and one special character';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length) return;

    setLoading(true);
    try {
      const mergeCart = useCartStore.getState().guestItemsForSync();
      await authService.register({ ...form, mergeCart });
      await useCartStore.getState().hydrate(true);
      await useWishlistStore.getState().hydrate();
      const redirect = params.get('redirect') || '/';
      toast('Account created — welcome to ShopSphere!', 'success');
      navigate(redirect, { replace: true });
    } catch (err) {
      setErrors((o) => ({ ...o, server: err.message || 'Registration failed' }));
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const field = (k) => (errors[k] ? ' input-error' : '');

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-8 text-center">
            <img src="/favicon.svg" alt="ShopSphere" className="mx-auto h-12 w-12" />
            <h1 className="mt-3 font-display text-2xl font-extrabold text-slate-900 dark:text-white">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Join lakhs of smart shoppers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="label" htmlFor="fullname">Full name</label>
              <input id="fullname" className={`input${field('fullname')}`} placeholder="Priya Sharma" value={form.fullname} onChange={set('fullname')} />
              {errors.fullname && <p className="error-text">{errors.fullname}</p>}
            </div>
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" type="email" className={`input${field('email')}`} placeholder="you@example.com" value={form.email} onChange={set('email')} />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone number</label>
              <input id="phone" type="tel" className={`input${field('phone')}`} placeholder="98765 43210" value={form.phone} onChange={set('phone')} />
              {errors.phone && <p className="error-text">{errors.phone}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input id="password" type="password" className={`input${field('password')}`} placeholder="••••••••" value={form.password} onChange={set('password')} />
                {errors.password && <p className="error-text">{errors.password}</p>}
              </div>
              <div>
                <label className="label" htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" type="password" className={`input${field('confirmPassword')}`} placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} />
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
              </div>
            </div>

            <p className="text-xs text-slate-400">Password needs 8+ characters with at least one number and one special character.</p>

            {errors.server && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">{errors.server}</p>}

            <button className="btn-primary btn-block" disabled={loading}>
              {loading ? <Spinner label="Creating account…" /> : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}