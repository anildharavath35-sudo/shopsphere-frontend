import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { XIcon, HomeIcon, HeartIcon, PackageIcon, LogoutIcon, UserIcon } from '../common/Icons';

export const MobileMenu = ({ open, onClose, categories }) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!open) return null;

  const close = () => onClose();

  const handleLogout = () => {
    logout();
    useCartStore.getState().resetForLogout();
    close();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={close} />
      <div className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col overflow-y-auto bg-white shadow-2xl dark:bg-slate-900 animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-700">
          <span className="font-display text-xl font-extrabold text-brand-700 dark:text-brand-300">
            Shop<span className="text-accent-500">Sphere</span>
          </span>
          <button onClick={close} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200" aria-label="Close menu">
            <XIcon size={22} />
          </button>
        </div>

        <div className="flex-1 py-2">
          {!isAuthenticated && (
            <div className="flex gap-2 px-4 py-3">
              <Link to="/login" onClick={close} className="btn-outline btn-sm flex-1">Login</Link>
              <Link to="/register" onClick={close} className="btn-primary btn-sm flex-1">Sign up</Link>
            </div>
          )}
          {isAuthenticated && (
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {user?.fullname?.[0]?.toUpperCase() || 'U'}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.fullname}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
          )}

          <nav className="px-2 py-2">
            <MobileLink to="/" icon={<HomeIcon size={18} />} label="Home" onClick={close} />
            {user?.role === 'admin' && <MobileLink to="/admin" icon={<UserIcon size={18} />} label="Admin Dashboard" onClick={close} />}
            <MobileLink to="/orders" icon={<PackageIcon size={18} />} label="My Orders" onClick={close} />
            <MobileLink to="/wishlist" icon={<HeartIcon size={18} />} label="Wishlist" onClick={close} />
            <MobileLink to="/account" icon={<UserIcon size={18} />} label="Account Settings" onClick={close} />

            <p className="px-4 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Shop by category</p>
            {categories.map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${c._id}`}
                onClick={close}
                className="block rounded-lg px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>

        {isAuthenticated && (
          <div className="border-t border-slate-200 p-4 dark:border-slate-700">
            <button onClick={handleLogout} className="btn-danger btn-sm w-full justify-center">
              <LogoutIcon size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const MobileLink = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand-600 dark:text-slate-200 dark:hover:bg-slate-800"
  >
    <span className="text-slate-400">{icon}</span>
    {label}
  </Link>
);