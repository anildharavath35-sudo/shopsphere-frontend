import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useUIStore } from '../../store/uiStore';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ConfirmDialog } from '../../components/common/Modal';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/common/Icons';
import { formatINR, discountPercent } from '../../utils/currency';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';


export default function AdminProductsPage() {
  useDocumentTitle('Products · Admin');
  const toast = useUIStore((s) => s.toast);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = (p = 1, q = query) => {
    setLoading(true);
    productService.getProducts({ page: p, limit: 20, search: q || undefined })
      .then((res) => {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      })
      .catch(() => toast('Could not load products', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page, query); }, [page]);

  const doDelete = async () => {
    setDeleting(true);
    try {
      await productService.deleteProduct(deleteTarget._id);
      toast('Product deleted', 'success');
      setDeleteTarget(null);
      load(page);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const searchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, query);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold">Products</h1>
        <Link to="/admin/products/new" className="btn-primary btn-sm"><PlusIcon size={16} /> Add Product</Link>
      </div>

      <form onSubmit={searchSubmit} className="flex max-w-md gap-2">
        <input
          className="input"
          placeholder="Search by name, brand…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn-secondary">Search</button>
      </form>

      {loading ? (
        <PageLoader text="Loading products…" />
      ) : products.length === 0 ? (
        <EmptyState icon="📦" title="No products found" description="Try a different search or add a product." />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="table-admin">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th className="text-right">Price</th>
                  <th className="text-center">Stock</th>
                  <th className="text-center">Flags</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={p.thumbnail || p.images?.[0]} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="clamp-1 max-w-56 text-sm font-semibold">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.brand} · {p.sku || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs">{p.category?.name || '—'}</td>
                    <td className="text-right">
                      <p className="text-sm font-bold">{formatINR(p.price)}</p>
                      {p.mrp > p.price && <p className="text-[10px] text-slate-400 line-through">{formatINR(p.mrp)} ({discountPercent(p.mrp, p.price)}% off)</p>}
                    </td>
                    <td className="text-center">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${p.stock <= 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : p.stock < 10 ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex flex-wrap justify-center gap-1 text-[9px] uppercase tracking-wide">
                        {p.featured && <span className="badge bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">Featured</span>}
                        {p.bestseller && <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Best</span>}
                        {!p.isActive && <span className="badge bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Hidden</span>}
                        {p.isActive && p.featured === false && p.bestseller === false && <span className="text-xs text-slate-300">—</span>}
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="btn-outline btn-sm" onClick={() => navigate(`/admin/products/${p._id}/edit`)}><EditIcon size={14} /></button>
                        <button className="btn-outline btn-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40" onClick={() => setDeleteTarget(p)}><TrashIcon size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
            <span className="text-xs text-slate-400">{pagination.total} product(s)</span>
            <div className="flex gap-2">
              <button className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span className="self-center text-xs">Page {page} / {pagination.totalPages}</span>
              <button className="btn-secondary btn-sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this product?"
        message={deleteTarget ? `"${deleteTarget.name}" will be permanently removed. This cannot be undone.` : ''}
        confirmText="Delete product"
        danger
        onConfirm={doDelete}
        loading={deleting}
      />
    </div>
  );
}