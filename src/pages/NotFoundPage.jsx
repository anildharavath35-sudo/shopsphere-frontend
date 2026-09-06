import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page Not Found');
  return (
    <div className="container-shop flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-7xl font-extrabold text-brand-100 dark:text-brand-950">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="btn-primary">Go Home</Link>
        <Link to="/products" className="btn-outline">Browse Products</Link>
      </div>
    </div>
  );
}