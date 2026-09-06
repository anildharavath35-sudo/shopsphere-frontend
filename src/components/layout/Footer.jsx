import { Link } from 'react-router-dom';
import { ShieldIcon, TruckIcon, RefreshIcon, WalletIcon, HomeIcon, HeartIcon, PackageIcon, TagIcon } from '../common/Icons';

const perks = [
  { icon: <TruckIcon size={20} />, title: 'Free & Fast Delivery', text: 'On orders above ₹999' },
  { icon: <ShieldIcon size={20} />, title: 'Secure Payments', text: 'Razorpay · COD available' },
  { icon: <RefreshIcon size={20} />, title: 'Easy Returns', text: '7-day return guarantee' },
  { icon: <WalletIcon size={20} />, title: 'Best Offers', text: 'Daily deals & coupons' },
];

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* perks */}
      <div className="container-shop grid grid-cols-2 gap-4 border-b border-slate-100 py-8 dark:border-slate-800 lg:grid-cols-4">
        {perks.map((p) => (
          <div key={p.title} className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-brand-300">
              {p.icon}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{p.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{p.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="container-shop grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
        <div>
          <p className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold text-brand-700 dark:text-brand-300">
            <img src="/favicon.svg" alt="" className="h-7 w-7" />
            Shop<span className="text-accent-500">Sphere</span>
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            India's modern online shopping destination. Great products, honest prices and lightning-fast delivery.
          </p>
        </div>

        <FooterLinks
          title="Shop"
          links={[
            { label: 'All Products', to: '/products' },
            { label: 'Best Sellers', to: '/products?sort=popularity' },
            { label: 'New Arrivals', to: '/products?sort=newest' },
            { label: 'Top Rated', to: '/products?sort=rating' },
          ]}
        />
        <FooterLinks
          title="Account"
          links={[
            { label: 'My Orders', to: '/orders' },
            { label: 'Wishlist', to: '/wishlist' },
            { label: 'Cart', to: '/cart' },
            { label: 'Addresses', to: '/addresses' },
            { label: 'Account Settings', to: '/account' },
          ]}
        />
        <FooterLinks
          title="Quick Links"
          links={[
            { label: 'Track Order', to: '/orders' },
            { label: 'Login', to: '/login' },
            { label: 'Register', to: '/register' },
          ]}
        />
      </div>

      <div className="border-t border-slate-200 py-5 dark:border-slate-800">
        <div className="container-shop flex flex-col items-center justify-between gap-2 text-xs text-slate-400 sm:flex-row">
          <p>© {year} ShopSphere. All rights reserved. Built with React + Node.js + MongoDB.</p>
          <p className="flex items-center gap-4">
            <span>Demo project — not affiliated with brands shown</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterLinks = ({ title, links }) => (
  <div>
    <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100">{title}</p>
    <ul className="space-y-2">
      {links.map((l) => (
        <li key={l.label}>
          <Link to={l.to} className="text-sm text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);