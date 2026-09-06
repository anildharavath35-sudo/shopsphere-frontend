import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, categoryService } from '../../services/productService';
import { useUIStore } from '../../store/uiStore';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PlusIcon, XIcon, ImageIcon } from '../../components/common/Icons';
import { PageLoader } from '../../components/common/Spinner';

const blank = {
  name: '', brand: '', category: '', description: '',
  mrp: '', price: '', stock: '', sku: '',
  featured: false, bestseller: false, isActive: true,
  thumbnail: '', images: [], tags: [], specifications: [],
};

const isEmpty = (s) => String(s ?? '').trim() === '';

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  useDocumentTitle(isEdit ? 'Edit Product · Admin' : 'Add Product · Admin');

  const toast = useUIStore((s) => s.toast);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(blank);
  const [loaded, setLoaded] = useState(!isEdit);
  const [saving, setSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data.categories)).catch(() => {});
    if (isEdit) {
      productService.getProduct(id)
        .then((res) => {
          const p = res.data.product;
          setForm({
            name: p.name, brand: p.brand, category: p.category?._id || '', description: p.description,
            mrp: p.mrp, price: p.price, stock: p.stock, sku: p.sku || '',
            featured: p.featured, bestseller: p.bestseller, isActive: p.isActive,
            thumbnail: p.thumbnail || '', images: p.images || [], tags: p.tags || [],
            specifications: p.specifications || [],
          });
          setTagsInput(p.tags.join(', '));
          setLoaded(true);
        })
        .catch((err) => { setError(err.message); setLoaded(true); });
    }
  }, [id, isEdit]);

  const validate = () => {
    const missing = [];
    if (isEmpty(form.name)) missing.push('name');
    if (!isEmpty(form.mrp) && !isEmpty(form.price) && Number(form.mrp) < Number(form.price)) missing.push('mrp below price');
    if (Number(form.stock) < 0) missing.push('stock negative');
    return missing;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const issues = validate();
    if (issues.length) {
      setError(`Please fix: ${issues.join(', ')}`);
      return;
    }
    setError('');
    setSaving(true);

    const data = {
      name: form.name,
      brand: form.brand,
      category: form.category,
      description: form.description,
      mrp: Number(form.mrp) || 0,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      sku: form.sku,
      featured: form.featured,
      bestseller: form.bestseller,
      isActive: form.isActive,
      thumbnail: form.thumbnail || form.images[0] || '',
      images: form.images.filter(Boolean),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      specifications: form.specifications.filter((s) => s.label && s.value),
    };

    try {
      if (isEdit) {
        await productService.updateProduct(id, data);
        toast('Product updated', 'success');
      } else {
        await productService.createProduct(data);
        toast('Product created', 'success');
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Failed to save product');
      setSaving(false);
    }
  };

  const addImageUrl = () => {
    setForm((f) => ({ ...f, images: [...f.images, ''] }));
  };
  const setImageAt = (i, v) => {
    const images = form.images.map((x, idx) => (idx === i ? v : x));
    setForm({ ...form, images });
  };
  const removeImageAt = (i) => {
    const images = form.images.filter((_, idx) => idx !== i);
    setForm({ ...form, images, thumbnail: form.thumbnail === images[i] ? '' : form.thumbnail });
  };
  const addSpec = () => {
    setForm((f) => ({ ...f, specifications: [...f.specifications, { label: '', value: '' }] }));
  };
  const setSpecAt = (i, key, v) => {
    const specifications = form.specifications.map((x, idx) => (idx === i ? { ...x, [key]: v } : x));
    setForm({ ...form, specifications });
  };
  const removeSpecAt = (i) => setForm((f) => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }));

  if (!loaded) return <PageLoader text="Loading product…" />;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      {error && <p className="rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="card space-y-4 p-6">
          <h2 className="font-display text-base font-bold">Basic Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Product name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Brand *</label>
              <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
            </div>
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description *</label>
              <textarea className="input min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div>
              <label className="label">MRP (₹)</label>
              <input type="number" min="0" className="input" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} />
            </div>
            <div>
              <label className="label">Selling price (₹)</label>
              <input type="number" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="label">Stock</label>
              <input type="number" min="0" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div>
              <label className="label">SKU (optional)</label>
              <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Tags (comma separated)</label>
              <input className="input" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="wireless, earbuds, bass" />
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded accent-brand-600" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Featured on home page
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded accent-brand-600" checked={form.bestseller} onChange={(e) => setForm({ ...form, bestseller: e.target.checked })} />
              Best seller
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded accent-brand-600" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Visible in store
            </label>
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-bold"><ImageIcon size={18} /> Images</h2>
            <p className="text-xs text-slate-400">Enter image URLs (Cloudinary upload arrives when keys are configured)</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={img || 'https://placehold.co/96x96?text=No+Image'}
                  alt={`Preview ${i + 1}`}
                  className="h-24 w-24 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                />
                <button
                  type="button"
                  onClick={() => removeImageAt(i)}
                  className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-white shadow"
                  aria-label="Remove image"
                >
                  <XIcon size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addImageUrl}
              className="grid h-24 w-24 place-items-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:border-brand-400 hover:text-brand-500 dark:border-slate-700"
            >
              <PlusIcon size={22} />
            </button>
          </div>
          <div className="space-y-2">
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input"
                  placeholder={`Image URL ${i + 1}`}
                  value={img}
                  onChange={(e) => setImageAt(i, e.target.value)}
                />
                <button type="button" className="btn-outline btn-sm whitespace-nowrap" onClick={() => setForm((f) => ({ ...f, thumbnail: img }))}>
                  Set thumbnail
                </button>
              </div>
            ))}
          </div>
          <div>
            <label className="label">Thumbnail URL</label>
            <input className="input" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="URL used in listings" />
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Specifications</h2>
            <button type="button" className="btn-outline btn-sm" onClick={addSpec}><PlusIcon size={14} /> Add row</button>
          </div>
          {form.specifications.length === 0 && <p className="text-xs text-slate-400">No specifications yet — optional.</p>}
          <div className="space-y-2">
            {form.specifications.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input className="input" placeholder="Label (e.g. Battery)" value={s.label} onChange={(e) => setSpecAt(i, 'label', e.target.value)} />
                <input className="input" placeholder="Value (e.g. 5000 mAh)" value={s.value} onChange={(e) => setSpecAt(i, 'value', e.target.value)} />
                <button type="button" className="btn-outline btn-sm" onClick={() => removeSpecAt(i)}><XIcon size={14} /></button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-outline" onClick={() => navigate('/admin/products')}>Cancel</button>
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}</button>
        </div>
      </form>
    </div>
  );
}