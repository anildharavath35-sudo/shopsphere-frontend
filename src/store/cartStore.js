import { create } from 'zustand';
import { cartService } from '../services/cartService';
import { getToken } from '../utils/storage';
import { useUIStore } from './uiStore';

const CART_KEY = 'ss_guest_cart';

// Must match server defaults (server/.env FREE_DELIVERY_THRESHOLD / DELIVERY_CHARGE)
const FREE_DELIVERY_THRESHOLD = 999;
const DELIVERY_CHARGE = 49;

const isPositiveQty = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 1;

// Load a guest cart from localStorage, keeping only well-formed entries
// { product: {...}, quantity: <positive integer> }. Old / malformed entries
// (missing product, bad quantity, stale `items` wrappers, etc.) are dropped
// so totals and merge logic never hit undefined fields.
const loadGuestCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((it) => it && it.product && typeof it.product === 'object' && typeof it.product._id === 'string')
      .map((it) => ({
        product: it.product,
        quantity: Math.max(1, Math.trunc(isPositiveQty(it.quantity) ? it.quantity : 1)),
      }));
  } catch {
    return [];
  }
};
const saveGuestCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const computeGuestTotals = (items) => {
  let subtotal = 0;
  let discount = 0;
  for (const it of items) {
    const p = it?.product;
    const price = Number(p?.price);
    if (!Number.isFinite(price)) continue;
    const mrp = Number(p?.mrp);
    subtotal += price * it.quantity;
    discount += Math.max(0, (Number.isFinite(mrp) ? mrp : price) - price) * it.quantity;
  }
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_CHARGE;
  return {
    subtotal,
    discount,
    deliveryCharge,
    total: subtotal + deliveryCharge,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    deliveryChargeRate: DELIVERY_CHARGE,
  };
};

// Guard against a malformed / partial server payload: items must be an array,
// totals an object, totalQuantity a number. Empty state is the safest default.
const normalizeServerCart = (cart) => {
  const items = Array.isArray(cart?.items) ? cart.items : [];
  return {
    items,
    totals: cart?.totals && typeof cart.totals === 'object' ? cart.totals : computeGuestTotals(items),
    totalQuantity: Number.isFinite(cart?.totalQuantity)
      ? cart.totalQuantity
      : items.reduce((s, it) => s + (isPositiveQty(it?.quantity) ? it.quantity : 0), 0),
  };
};

export const useCartStore = create((set, get) => ({
  items: [],
  totals: computeGuestTotals([]),
  totalQuantity: 0,
  loaded: false,
  loading: false,
  synced: false, // true when items come from the backend DB

  /** Load cart: server DB when logged in, else localStorage guest cart. */
  hydrate: async (silent = false) => {
    if (getToken()) {
      return get().fetchServerCart(silent);
    }
    const items = loadGuestCart();
    set({
      items,
      totals: computeGuestTotals(items),
      totalQuantity: items.reduce((s, it) => s + it.quantity, 0),
      loaded: true,
      synced: false,
    });
  },

  fetchServerCart: async (silent = false) => {
    if (!silent) set({ loading: true });
    try {
      const res = await cartService.get();
      const cart = normalizeServerCart(res.data.cart);
      set({
        items: cart.items,
        totals: cart.totals,
        totalQuantity: cart.totalQuantity,
        loaded: true,
        loading: false,
        synced: true,
      });
    } catch {
      set({ loading: false, loaded: true });
    }
  },

  addItem: async (product, quantity = 1) => {
    const token = getToken();
    if (token && get().synced) {
      try {
        const res = await cartService.add(product._id, quantity);
        get().applyServerCart(res.data.cart);
        return true;
      } catch (err) {
        useUIStore.getState().toast(err.message || 'Could not add to cart', 'error');
        return false;
      }
    }
    // guest path
    const items = token ? [...get().items] : loadGuestCart();
    const existing = items.find((it) => it.product._id === product._id);
    const room = Math.max(0, product.stock - (existing?.quantity || 0));
    if (room < quantity) {
      useUIStore.getState().toast(`Only ${product.stock} unit(s) of this product are available`, 'error');
      return false;
    }
    if (existing) existing.quantity += quantity;
    else items.push({ product, quantity });
    if (!token) saveGuestCart(items);
    useUIStore.getState().toast('Added to cart', 'success');
    set({ items, totals: computeGuestTotals(items), totalQuantity: items.reduce((s, it) => s + it.quantity, 0) });
    return true;
  },

  updateQuantity: async (productId, quantity) => {
    if (getToken() && get().synced) {
      try {
        const res = await cartService.update(productId, quantity);
        get().applyServerCart(res.data.cart);
        return;
      } catch (err) {
        useUIStore.getState().toast(err.message, 'error');
        return;
      }
    }
    const items = get().items.map((it) =>
      it.product._id === productId
        ? { ...it, quantity: Math.min(quantity, it.product.stock) }
        : it
    );
    if (!getToken()) saveGuestCart(items);
    set({ items, totals: computeGuestTotals(items), totalQuantity: items.reduce((s, it) => s + it.quantity, 0) });
  },

  removeItem: async (productId) => {
    if (getToken() && get().synced) {
      try {
        const res = await cartService.remove(productId);
        get().applyServerCart(res.data.cart);
        return;
      } catch (err) {
        useUIStore.getState().toast(err.message, 'error');
        return;
      }
    }
    const items = get().items.filter((it) => it.product._id !== productId);
    if (!getToken()) saveGuestCart(items);
    set({ items, totals: computeGuestTotals(items), totalQuantity: items.reduce((s, it) => s + it.quantity, 0) });
  },

  clearLocal: () => {
    saveGuestCart([]);
    set({ items: [], totals: computeGuestTotals([]), totalQuantity: 0 });
  },

  /** After login/registration: hand guest items to backend merge. */
  guestItemsForSync: () => {
    return loadGuestCart().map((it) => ({ productId: it.product._id, quantity: it.quantity }));
  },

  applyServerCart: (cart) => {
    const normalized = normalizeServerCart(cart);
    set({
      items: normalized.items,
      totals: normalized.totals,
      totalQuantity: normalized.totalQuantity,
      loaded: true,
      synced: true,
    });
    saveGuestCart([]);
  },

  resetForLogout: () => {
    set({
      items: [],
      totals: computeGuestTotals([]),
      totalQuantity: 0,
      loaded: true,
      synced: false,
    });
  },
}));