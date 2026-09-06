import { useEffect, useState } from 'react';
import { categoryService, productService } from '../../services/productService';
import { useUIStore } from '../../store/uiStore';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/common/Icons';
import { EmptyState } from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Spinner';

const blank = { name: '', description: '', image: '', order: 0 };

export default function AdminCategoriesPage() {
  useDocumentTitle('Categories · Admin');
  const toast = useUIStore((s) => s.toast);
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([categoryService.getAll(), productService.getProducts({ limit: 1 })])
      .then(([cats]) => {
        setCategories(cats.data.categories);
      })
      .catch(() => toast('Could not load categories', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // count products per category via a broad list
    productService.getProducts({ limit: 48 })
      .then((res) => {
        const map = {};
        res.data.products.forEach((p) => {
          const cid = p.category?._id;
          if (cid) map[cid] = (map[cid] || 0) + 1;
        });
        setProductCounts(map);
      })
      .catch(() => {});
  }, []);

  const openNew = () => { setForm(blank); setEditing('new'); };
  const openEdit = (c) => { setForm({ name: c.name, description: c.description, image: c.image || '', order: c.order }); setEditing(c); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast('Category name is required', 'error'); return; }
    setSaving(true);
    try {
      if (editing === 'new') await categoryService.create(form);
      else await categoryService.update(editing._id, form);
      toast('Category saved', 'success');
      setEditing(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setWorking(true);
    try {
      await categoryService.remove(deleting._id);
      toast('Category deleted', 'success');
      setDeleting(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setWorking(false);
    }
  };

  if (loading && categories.length === 0) return <PageLoader text="Loading categories…" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold">Categories</h1>
        <button className="btn-primary btn-sm" onClick={openNew}><PlusIcon size={16} /> Add Category</button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon="🗂️" title="No categories yet" description="Create categories so you can organize products." action={<button className="btn-primary" onClick={openNew}>Add Category</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c._id} className="card flex items-center gap-4 p-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-xl font-extrabold text-brand-500">{(c.name || '?')[0]}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{c.name}</p>
                <p className="text-xs text-slate-400">{productCounts[c._id] || 0} product(s) {c.isActive ? '· visible' : '· hidden'}</p>
              </div>
              <div className="flex gap-1.5">
                <button className="btn-outline btn-sm" onClick={() => openEdit(c)}><EditIcon size={14} /></button>
                <button className="btn-outline btn-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40" onClick={() => setDeleting(c)}><TrashIcon size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add Category' : 'Edit Category'}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-[1fr_90px] gap-3">
            <div>
              <label className="label">Image URL</label>
              <input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" />
            </div>
            <div>
              <label className="label">Sort order</label>
              <input type="number" className="input" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this category?"
        message={deleting ? `"${deleting.name}" will be removed. Products in this category won't be deleted.` : ''}
        confirmText="Delete category"
        danger
        onConfirm={doDelete}
        loading={working}
      />
    </div>
  );
}