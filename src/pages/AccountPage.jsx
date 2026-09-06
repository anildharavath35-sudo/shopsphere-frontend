import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { CheckIcon } from '../components/common/Icons';
import { Spinner } from '../components/common/Spinner';

const passwordRule = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function AccountPage() {
  useDocumentTitle('My Account');
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const toast = useUIStore((s) => s.toast);
  const [profile, setProfile] = useState({ fullname: user?.fullname || '', phone: user?.phone || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState('');
  const [errors, setErrors] = useState({});

  const saveProfile = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!profile.fullname.trim()) errs.fullname = 'Name required';
    if (!/^\S+@\S+\.\S+$/.test(profile.email)) errs.email = 'Valid email required';
    if (!/^[0-9+\-\s()]{10,15}$/.test(profile.phone)) errs.phone = 'Valid phone required';
    setErrors((o) => ({ ...o, profile: errs }));
    if (Object.keys(errs).length) return;

    setSaving('profile');
    try {
      const res = await authService.updateProfile({ fullname: profile.fullname, phone: profile.phone });
      setUser(res.data.user);
      toast('Profile updated', 'success');
    } catch (err) {
      setErrors((o) => ({ ...o, profile: { server: err.message } }));
    } finally {
      setSaving('');
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwords.currentPassword) errs.currentPassword = 'Current password required';
    if (!passwordRule.test(passwords.newPassword)) errs.newPassword = '8+ chars with a number and special character';
    if (passwords.newPassword !== passwords.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors((o) => ({ ...o, password: errs }));
    if (Object.keys(errs).length) return;

    setSaving('password');
    try {
      await authService.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast('Password changed', 'success');
    } catch (err) {
      setErrors((o) => ({ ...o, password: { server: err.message } }));
    } finally {
      setSaving('');
    }
  };

  const field = (k, group) => (errors[group]?.[k] ? ' input-error' : '');
  const clientName = 'Web Storefront';

  return (
    <div className="container-shop py-8">
      <h1 className="section-title mb-6">My Account</h1>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* sidebar */}
        <aside className="space-y-6">
          <div className="card flex items-center gap-4 p-5">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-600 font-display text-xl font-extrabold text-white">
              {(user?.fullname || 'U').split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="clamp-1 font-bold">{user?.fullname}</p>
              <p className="clamp-1 text-xs text-slate-400">{user?.email}</p>
              <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {user?.role}
              </span>
            </div>
          </div>

          <nav className="card divide-y divide-slate-100 overflow-hidden p-0 dark:divide-slate-800">
            <Link to="/account" className="flex items-center justify-between bg-brand-50/60 px-5 py-3 text-sm font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">Profile & Security <CheckIcon size={16} /></Link>
            <Link to="/orders" className="flex items-center justify-between px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60">My Orders</Link>
            <Link to="/addresses" className="flex items-center justify-between px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60">Addresses</Link>
            <Link to="/wishlist" className="flex items-center justify-between px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60">Wishlist</Link>
          </nav>
        </aside>

        {/* main column */}
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Personal Information</h2>
            <form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
              <div>
                <label className="label">Full name</label>
                <input className={`input${field('fullname', 'profile')}`} value={profile.fullname} onChange={(e) => setProfile({ ...profile, fullname: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className={`input${field('phone', 'profile')}`} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Email (cannot be changed)</label>
                <input className="input cursor-not-allowed bg-slate-50 text-slate-400 dark:bg-slate-800" value={profile.email} disabled />
              </div>
              {errors.profile?.server && <p className="error-text sm:col-span-2">{errors.profile.server}</p>}
              <div className="sm:col-span-2">
                <button className="btn-primary" disabled={saving === 'profile'}>
                  {saving === 'profile' ? <Spinner label="Saving…" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Change Password</h2>
            <form onSubmit={savePassword} className="mt-5 grid gap-4" noValidate>
              <div>
                <label className="label">Current password</label>
                <input type="password" className={`input${field('currentPassword', 'password')}`} value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">New password</label>
                  <input type="password" className={`input${field('newPassword', 'password')}`} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
                  {errors.password?.newPassword && <p className="error-text">{errors.password.newPassword}</p>}
                </div>
                <div>
                  <label className="label">Confirm new password</label>
                  <input type="password" className={`input${field('confirmPassword', 'password')}`} value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
                  {errors.password?.confirmPassword && <p className="error-text">{errors.password.confirmPassword}</p>}
                </div>
              </div>
              {errors.password?.server && <p className="error-text">{errors.password.server}</p>}
              <div>
                <button className="btn-outline" disabled={saving === 'password'}>
                  {saving === 'password' ? <Spinner label="Updating…" /> : 'Update Password'}
                </button>
              </div>
            </form>
          </section>

          <section className="card flex flex-wrap items-center justify-between gap-3 p-6">
            <div>
              <h2 className="font-display text-base font-bold">Active Session</h2>
              <p className="mt-1 text-xs text-slate-400">Signed in on {clientName} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Secured
            </span>
          </section>
        </div>
      </div>
    </div>
  );
}