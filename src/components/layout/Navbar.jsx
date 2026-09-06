import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useUIStore } from '../../store/uiStore';
import { categoryService } from '../../services/productService';
import { initials } from '../../utils/currency';
import { SearchBar } from './SearchBar';
import { MobileMenu } from './MobileMenu';
import { CartIcon, HeartIcon, UserIcon, MoonIcon, SunIcon, MenuIcon, ChevronDown, LogoutIcon, PackageIcon, MapPinIcon, TagIcon, TruckIcon, ChartIcon } from '../common/Icons';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalQuantity = useCartStore((s) => s.totalQuantity);
  const wishCount = useWishlistStore((s) => s.products.length);
  const { theme, toggleTheme } = useUIStore();
  const [categories, setCategories] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    categoryService
      .getCategories()
      .then((res) => setCategories(res.data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onClick = (e) => accountRef.current && !accountRef.current.contains(e.target) && setAccountOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    logout(true);
    navigate('/');
  };

  const accountMenu = [
    { label: 'My Orders', to: '/orders', icon: <PackageIcon size={16} /> },
    { label: 'My Wishlist', to: '/wishlist', icon: <HeartIcon size={16} /> },
    { label: 'Addresses', to: '/addresses', icon: <MapPinIcon size={16} /> },
    { label: 'Account Settings', to: '/account', icon: <UserIcon size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* utility bar */}
      <div className="bg-slate-900 text-slate-200 dark:bg-black">
        <div className="container-shop flex h-9 items-center justify-between text-xs">
          <p className="hidden sm:block">Free delivery on orders above ₹999 · COD available</p>
          <div className="flex items-center gap-4">
            <Link to="/orders" className="hover:text-white">Track Order</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-1 font-semibold text-accent-400 hover:text-accent-300">
                <ChartIcon size={13} /> Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* main bar */}
      <div className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="container-shop flex h-16 items-center gap-4">
          {/* mobile hamburger */}
          <button className="lg:hidden text-slate-700 dark:text-slate-200" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <MenuIcon size={24} />
          </button>

          {/* logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="ShopSphere" className="h-9 w-9" />
            <span className="hidden font-display text-2xl font-extrabold tracking-tight text-brand-700 dark:text-brand-300 sm:block">
              Shop<span className="text-accent-500">Sphere</span>
            </span>
          </Link>

          {/* search (desktop) */}
          <div className="hidden flex-1 justify-center md:flex">
            <SearchBar />
          </div>

          {/* actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
            <button
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            </button>

            <Link to="/wishlist" className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Wishlist">
              <HeartIcon size={22} />
              {wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {wishCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Cart">
              <CartIcon size={22} />
              {totalQuantity > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {totalQuantity}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex h-10 items-center gap-1.5 rounded-full pl-1.5 pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.fullname} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      initials(user?.fullname)
                    )}
                  </span>
                  <ChevronDown size={16} className="hidden text-slate-500 sm:block" />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900 animate-scale-in">
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.fullname}</p>
                      <p className="truncate text-xs text-slate-400">{user?.email}</p>
                    </div>
                    {accountMenu.map((m) => (
                      <NavLink
                        key={m.to}
                        to={m.to}
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        {m.icon}
                        {m.label}
                      </NavLink>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      <LogoutIcon size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-outline btn-sm hidden sm:inline-flex">Login</Link>
                <Link to="/register" className="btn-primary btn-sm">Sign up</Link>
              </div>
            )}
          </div>
        </div>

        {/* category nav */}
        <nav className="container-shop hidden items-center gap-1 overflow-x-auto pb-2 lg:flex" aria-label="Categories">
          {categories.map((c) => (
            <Link
              key={c._id}
              to={`/products?category=${c._id}`}
              className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-300"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} categories={categories} />
    </header>
  );
};