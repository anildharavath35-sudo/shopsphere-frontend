import { useEffect, useState } from 'react';
import { addressService } from '../services/orderService';
import { useUIStore } from '../store/uiStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Modal, ConfirmDialog } from '../components/common/Modal';
import { PlusIcon, EditIcon, TrashIcon, CheckIcon } from '../components/common/Icons';
import { PageLoader } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';

const blank = { fullname: '', phone: '', address: '', apartment: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false };

export default function AddressesPage() {
  useDocumentTitle('My Addresses');
  const toast = useUIStore((s) => s.toast);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | address object | 'new'
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = () => addressService.getAll().then((res) => setAddresses(res.data.addresses)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(blank); setEditing('new'); };
  const openEdit = (a) => { setForm({ ...a }); setEditing(a); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing === 'new') await addressService.create(form);
      else await addressService.update(editing._id, form);
      toast('Address saved', 'success');
      setEditing(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await addressService.remove(deleting._id);
      toast('Address deleted', 'success');
      setDeleting(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  if (loading && addresses.length === 0) return <PageLoader text="Loading addresses…" />;

  return (
    <div className="container-shop py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title mb-0">My Addresses</h1>
        <button className="btn-primary btn-sm" onClick={openNew}><PlusIcon size={16} /> Add Address</button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon="📍"
          title="No saved addresses"
          description="Save your shipping addresses here to check out faster."
          action={<button className="btn-primary" onClick={openNew}>Add your first address</button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((a) => (
            <div key={a._id} className="card relative p-5">
              {a.isDefault && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckIcon size={12} /> Default
                </span>
              )}
              <p className="mt-2 text-sm font-bold">{a.fullname}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {a.address}{a.apartment ? `, ${a.apartment}` : ''}<br />
                {a.city}, {a.state} {a.postalCode}<br />
                {a.country}
              </p>
              <p className="mt-2 text-xs text-slate-400">📞 {a.phone}</p>
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button className="btn-outline btn-sm flex-1" onClick={() => openEdit(a)}><EditIcon size={14} /> Edit</button>
                <button className="btn-outline btn-sm flex-1" onClick={() => setDeleting(a)}><TrashIcon size={14} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add Address' : 'Edit Address'} size="lg">
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Apartment / Landmark (optional)</label>
            <input className="input" value={form.apartment} onChange={(e) => setForm({ ...form, apartment: e.target.value })} />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
          </div>
          <div>
            <label className="label">Postal code</label>
            <input className="input" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} required />
          </div>
          <div>
            <label className="label">Country</label>
            <input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="h-4 w-4 rounded accent-brand-600" />
            Set as default address
          </label>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Address'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this address?"
        confirmText="Delete"
        onConfirm={confirmDelete}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">This address will be permanently removed from your address book.</p>
      </ConfirmDialog>
    </div>
  );
}