import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { Toaster } from '../components/common/Toaster';
import {
  ChartIcon, PackageIcon, TagIcon, UsersIcon, UserIcon,
  MoonIcon, SunIcon, LogoutIcon, HomeIcon, MenuIcon, XIcon,
} from '../components/common/Icons';
import { useState } from 'react';

const links = [
  { to: '/admin', label: 'Dashboard', icon: <ChartIcon size={18} />, end: true },
  { to: '/admin/products', label: 'Products', icon: <PackageIcon size={18} /> },
  { to: '/admin/categories', label: 'Categories', icon: <TagIcon size={18} /> },
  { to: '/admin/orders', label: 'Orders', icon: <ChartIcon size={18} /> },
  { to: '/admin/users', label: 'Customers', icon: <UsersIcon size={18} /> },
];

export const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout(true);
    navigate('/login');
  };

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <img src="/favicon.svg" alt="" className="h-8 w-8" />
        <div>
          <p className="font-display text-lg font-extrabold leading-tight text-brand-700 dark:text-brand-300">
            Shop<span className="text-accent-500">Sphere</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
              }`
            }
          >
            {l.icon}
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">
          <HomeIcon size={18} /> Back to store
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
        >
          <LogoutIcon size={18} /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* desktop sidebar */}
      <div className="hidden lg:block">{sidebar}</div>

      {/* mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full animate-fade-in">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* topbar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
          <button className="lg:hidden text-slate-600 dark:text-slate-300" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            {mobileOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
          </button>
          <div className="flex-1" />
          <button onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Toggle theme">
            {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
          <span className="flex items-center gap-2 rounded-full bg-slate-100 py-1 pl-1 pr-3 dark:bg-slate-800">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
              {user?.fullname?.[0]?.toUpperCase() || 'A'}
            </span>
            <span className="hidden text-sm font-semibold sm:block">{user?.fullname}</span>
            <UserIcon size={14} className="text-slate-400" />
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
};