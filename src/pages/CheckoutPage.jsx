import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { orderService, addressService, paymentService } from '../services/orderService';
import { useRazorpay } from '../hooks/useRazorpay';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { CartSummary } from '../components/cart/CartSummary';
import { Modal } from '../components/common/Modal';
import { BankIcon, WalletIcon, TruckIcon, CheckIcon } from '../components/common/Icons';
import { formatINR } from '../utils/currency';
import { Spinner } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';

const STEPS = [
  { id: 1, label: 'Contact' },
  { id: 2, label: 'Address' },
  { id: 3, label: 'Review' },
  { id: 4, label: 'Payment' },
];

const emptyAddress = {
  fullname: '',
  phone: '',
  address: '',
  apartment: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
};

export default function CheckoutPage() {
  useDocumentTitle('Checkout');
  const navigate = useNavigate();
  const toast = useUIStore((s) => s.toast);
  const { items, totals, totalQuantity } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const { openCheckout } = useRazorpay();

  const [step, setStep] = useState(1);
  const [contact, setContact] = useState({ email: user?.email || '', phone: user?.phone || '' });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressMode, setAddressMode] = useState('new'); // 'new' | 'saved'
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [address, setAddress] = useState({ ...emptyAddress, fullname: user?.fullname || '', phone: user?.phone || '' });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [placing, setPlacing] = useState(false);
  const [devDialog, setDevDialog] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    addressService.getAll().then((res) => {
      setSavedAddresses(res.data.addresses);
      const def = res.data.addresses.find((a) => a.isDefault);
      if (def) {
        setAddressMode('saved');
        setSelectedAddressId(def._id);
      }
    }).catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <div className="container-shop py-16">
        <EmptyState
          icon="🧾"
          title="Nothing to checkout"
          description="Your cart is empty. Add some products first."
          action={<Link to="/products" className="btn-primary">Browse Products</Link>}
        />
      </div>
    );
  }

  const validateContact = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) e.email = 'Valid email required';
    if (!/^[0-9+\-\s()]{10,15}$/.test(contact.phone)) e.phone = 'Valid phone required';
    setErrors((prev) => ({ ...prev, contact: e }));
    return Object.keys(e).length === 0;
  };

  const validateAddress = () => {
    if (addressMode === 'saved' && selectedAddressId) return true;
    const e = {};
    const required = { fullname: 'Full name', address: 'Address', city: 'City', state: 'State', postalCode: 'Postal code', country: 'Country' };
    Object.entries(required).forEach(([k, label]) => {
      if (!address[k]?.trim()) e[k] = `${label} is required`;
    });
    if (!/^[0-9+\-\s()]{10,15}$/.test(address.phone)) e.phone = 'Valid phone required';
    setErrors((prev) => ({ ...prev, address: e }));
    return Object.keys(e).length === 0;
  };

  const getAddressPayload = () => {
    if (addressMode === 'saved' && selectedAddressId) {
      const a = savedAddresses.find((x) => x._id === selectedAddressId);
      return {
        fullname: a.fullname, phone: a.phone, address: a.address, apartment: a.apartment,
        city: a.city, state: a.state, postalCode: a.postalCode, country: a.country,
      };
    }
    return address;
  };

  const next = () => {
    if (step === 1 && !validateContact()) return;
    if (step === 2 && !validateAddress()) return;
    setStep((s) => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveAddressToBook = async (payload) => {
    // persist a manually entered address to the address book
    try {
      await addressService.create({ ...payload, isDefault: false });
    } catch { /* non-fatal - order still works */ }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const payload = {
        address: getAddressPayload(),
        paymentMethod,
      };
      const res = await orderService.create(payload);
      const order = res.data.order;

      if (order.paymentMethod === 'cod') {
        await useCartStore.getState().hydrate(true);
        toast('Order placed successfully!', 'success');
        navigate(`/order-success/${order._id}`, { replace: true });
        return;
      }

      // Razorpay path
      console.log('[ShopSphere] Creating payment order…');
      const pRes = await paymentService.createOrder(order._id);
      const pay = pRes.data;

      if (pay.devMode) {
        setDevDialog({ order, amount: pay.amount / 100, currency: 'INR' });
        return; // user clicks "Simulate payment" next
      }

      openCheckout({
        key: pay.keyId,
        orderId: pay.razorpayOrderId,
        amount: pay.amount,
        description: `Order ${order.orderId}`,
        email: contact.email,
        phone: contact.phone,
        onSuccess: async (response) => {
          await paymentService.verify({
            orderId: order._id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          await useCartStore.getState().hydrate(true);
          toast('Payment successful!', 'success');
          navigate(`/order-success/${order._id}`, { replace: true });
        },
        onFailure: (msg) => {
          toast(msg || 'Payment could not be completed.', 'error');
          setPlacing(false);
        },
      });
    } catch (err) {
      toast(err.message || 'Unable to place order.', 'error');
      setPlacing(false);
    }
  };

  const simulateDevPayment = async () => {
    const { order } = devDialog;
    setPlacing(true);
    try {
      await paymentService.verify({
        orderId: order._id,
        razorpayPaymentId: 'pay_dev_' + Date.now(),
        devSimulate: true,
      });
      await useCartStore.getState().hydrate(true);
      toast('Payment verified (dev mode)', 'success');
      navigate(`/order-success/${order._id}`, { replace: true });
    } catch (err) {
      toast(err.message, 'error');
      setPlacing(false);
    }
  };

  const isActive = (s) => step >= s;

  return (
    <div className="container-shop py-8">
      <h1 className="section-title mb-2">Checkout</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{totalQuantity} item(s) · total {formatINR(totals.total)}</p>

      {/* stepper */}
      <ol className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors ${
                isActive(s.id) ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {step > s.id ? <CheckIcon size={16} /> : s.id}
            </span>
            <span className={`hidden text-sm font-medium sm:block ${isActive(s.id) ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && <span className={`h-0.5 flex-1 ${isActive(s.id + 1) ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}`} />}
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* STEP 1 — contact */}
          {step === 1 && (
            <section className="card p-6 animate-fade-in">
              <h2 className="font-display text-lg font-bold">Customer Information</h2>
              <p className="mt-1 text-sm text-slate-400">We'll use these for order updates and delivery coordination.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Email address</label>
                  <input className="input" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                  {errors.contact?.email && <p className="error-text">{errors.contact.email}</p>}
                </div>
                <div>
                  <label className="label">Phone number</label>
                  <input className="input" type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                  {errors.contact?.phone && <p className="error-text">{errors.contact.phone}</p>}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="btn-primary" onClick={next}>Continue →</button>
              </div>
            </section>
          )}

          {/* STEP 2 — address */}
          {step === 2 && (
            <section className="card p-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Shipping Address</h2>
                {savedAddresses.length > 0 && (
                  <div className="flex gap-2">
                    <button className={`btn-sm ${addressMode === 'saved' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAddressMode('saved')}>Saved</button>
                    <button className={`btn-sm ${addressMode === 'new' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAddressMode('new')}>New</button>
                  </div>
                )}
              </div>

              {addressMode === 'saved' ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {savedAddresses.map((a) => (
                    <button
                      key={a._id}
                      onClick={() => setSelectedAddressId(a._id)}
                      className={`rounded-xl border-2 p-4 text-left transition-colors ${
                        selectedAddressId === a._id ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/30' : 'border-slate-200 hover:border-brand-300 dark:border-slate-700'
                      }`}
                    >
                      <p className="text-sm font-bold">{a.fullname}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {a.address}{a.apartment ? `, ${a.apartment}` : ''} — {a.city}, {a.state} {a.postalCode}, {a.country}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Full name</label>
                    <input className={`input ${errors.address?.fullname ? 'input-error' : ''}`} value={address.fullname} onChange={(e) => setAddress({ ...address, fullname: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input className={`input ${errors.address?.phone ? 'input-error' : ''}`} value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Address (house no, street, area)</label>
                    <input className={`input ${errors.address?.address ? 'input-error' : ''}`} value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Apartment / Building / Landmark (optional)</label>
                    <input className="input" value={address.apartment} onChange={(e) => setAddress({ ...address, apartment: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input className={`input ${errors.address?.city ? 'input-error' : ''}`} value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <input className={`input ${errors.address?.state ? 'input-error' : ''}`} value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Postal code</label>
                    <input className={`input ${errors.address?.postalCode ? 'input-error' : ''}`} value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Country</label>
                    <input className="input" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button className="btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary" onClick={next}>Continue →</button>
              </div>
            </section>
          )}

          {/* STEP 3 — summary */}
          {step === 3 && (
            <section className="card p-6 animate-fade-in">
              <h2 className="font-display text-lg font-bold">Order Summary</h2>
              <p className="mt-1 text-sm text-slate-400">Confirm the items before placing your order.</p>
              <div className="mt-5 space-y-3">
                {items.map((it) => (
                  <div key={it.product._id} className="flex items-center gap-3">
                    <img src={it.product.thumbnail || it.product.images?.[0]} alt={it.product.name} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="clamp-1 text-sm font-medium text-slate-800 dark:text-slate-100">{it.product.name}</p>
                      <p className="text-xs text-slate-400">Qty: {it.quantity}</p>
                    </div>
                    <p className="text-sm font-bold">{formatINR(it.product.price * it.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Delivering to</span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <TruckIcon size={16} className="text-brand-500" />
                  {getAddressPayload().city || (getAddressPayload() && savedAddresses.find((x) => x._id === selectedAddressId)?.city)}
                </span>
              </div>
              <div className="mt-6 flex justify-between">
                <button className="btn-outline" onClick={() => setStep(2)}>← Back</button>
                <button className="btn-primary" onClick={() => setStep(4)}>Choose Payment →</button>
              </div>
            </section>
          )}

          {/* STEP 4 — payment */}
          {step === 4 && (
            <section className="card p-6 animate-fade-in">
              <h2 className="font-display text-lg font-bold">Payment Method</h2>
              <div className="mt-5 space-y-3">
                <button
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-colors ${
                    paymentMethod === 'razorpay' ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/30' : 'border-slate-200 hover:border-brand-300 dark:border-slate-700'
                  }`}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${paymentMethod === 'razorpay' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                    <BankIcon size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">Razorpay — Cards / UPI / Netbanking</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">100% secure payments powered by Razorpay. Pay {formatINR(totals.total)} securely.</span>
                  </span>
                </button>
                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-colors ${
                    paymentMethod === 'cod' ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/30' : 'border-slate-200 hover:border-brand-300 dark:border-slate-700'
                  }`}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${paymentMethod === 'cod' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                    <WalletIcon size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">Cash on Delivery</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">Pay when your order arrives. Available for orders below ₹50,000.</span>
                  </span>
                </button>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button className="btn-outline" onClick={() => setStep(3)}>← Back</button>
                <button className="btn-accent btn-lg flex-1 sm:flex-none sm:min-w-64" onClick={placeOrder} disabled={placing}>
                  {placing ? <Spinner label="Placing order…" /> : `Place Order · ${formatINR(totals.total)}`}
                </button>
              </div>
              <p className="mt-3 text-center text-xs text-slate-400">
                By placing this order you agree to our terms and 7-day return policy.
              </p>
            </section>
          )}
        </div>

        {/* summary sidebar */}
        <CartSummary />
      </div>

      {/* DEV MODE payment simulation dialog */}
      <Modal open={Boolean(devDialog)} onClose={() => setDevDialog(null)} title="Payment Gateway (Dev Mode)">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Razorpay keys are not configured and <b>PAYMENT_DEV_MODE</b> is enabled on the server. To keep the full order flow working without a live gateway:
        </p>
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-700 dark:bg-amber-950/40">
          <p className="font-semibold text-amber-800 dark:text-amber-300">Simulate payment of {devDialog && formatINR(devDialog.amount)}</p>
          <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">
            In production, this would open the Razorpay checkout. Add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET and set PAYMENT_DEV_MODE=false to go live.
          </p>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button className="btn-outline" onClick={() => setDevDialog(null)} disabled={placing}>Cancel</button>
          <button className="btn-primary" onClick={simulateDevPayment} disabled={placing}>
            {placing ? <Spinner label="Verifying…" /> : 'Simulate Payment Success'}
          </button>
        </div>
      </Modal>
    </div>
  );
}