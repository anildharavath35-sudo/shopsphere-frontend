import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { PageLoader } from './Spinner';

export const ProtectedRoute = ({ children, loading = false }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
};

export const AdminRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (user?.role !== 'admin') {
    return (
      <div className="container-shop py-20 text-center">
        <h1 className="font-display text-2xl font-bold">403 — Forbidden</h1>
        <p className="mt-2 text-slate-500">You need admin access to view this page.</p>
        <a href="/" className="btn-primary mt-6">Back to Home</a>
      </div>
    );
  }
  return children;
};

export const GuestOnly = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};