import { create } from 'zustand';
import { wishlistService } from '../services/wishlistService';
import { getToken } from '../utils/storage';
import { useUIStore } from './uiStore';
import { useCartStore } from './cartStore';

const WISHLIST_KEY = 'ss_guest_wishlist';

const loadGuestWishlist = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const saveGuestWishlist = (list) => localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));

export const useWishlistStore = create((set, get) => ({
  products: [],
  loaded: false,

  hydrate: async () => {
    if (!getToken()) {
      set({ products: loadGuestWishlist(), loaded: true });
      return;
    }
    try {
      const res = await wishlistService.get();
      set({ products: res.data.wishlist.products.filter((p) => p), loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  isWishlisted: (productId) => get().products.some((p) => p._id === productId),

  toggle: async (product) => {
    const existing = get().isWishlisted(product._id);
    if (getToken()) {
      try {
        if (existing) {
          const res = await wishlistService.remove(product._id);
          set({ products: res.data.wishlist.products.filter((p) => p) });
          useUIStore.getState().toast('Removed from wishlist', 'info');
        } else {
          const res = await wishlistService.add(product._id);
          set({ products: res.data.wishlist.products.filter((p) => p) });
          useUIStore.getState().toast('Added to wishlist', 'success');
        }
      } catch (err) {
        useUIStore.getState().toast(err.message, 'error');
      }
      return;
    }
    // guest
    let list = loadGuestWishlist();
    if (existing) list = list.filter((p) => p._id !== product._id);
    else list = [product, ...list];
    saveGuestWishlist(list);
    set({ products: list });
    useUIStore.getState().toast(existing ? 'Removed from wishlist' : 'Added to wishlist', existing ? 'info' : 'success');
  },

  remove: async (productId) => {
    if (getToken()) {
      try {
        const res = await wishlistService.remove(productId);
        set({ products: res.data.wishlist.products.filter((p) => p) });
      } catch (err) {
        useUIStore.getState().toast(err.message, 'error');
      }
      return;
    }
    let list = loadGuestWishlist().filter((p) => p._id !== productId);
    saveGuestWishlist(list);
    set({ products: list });
  },

  moveToCart: async (product, quantity = 1) => {
    if (getToken()) {
      try {
        await wishlistService.moveToCart(product._id, quantity);
        await useCartStore.getState().hydrate(true);
        await get().hydrate();
        useUIStore.getState().toast('Moved to cart', 'success');
      } catch (err) {
        useUIStore.getState().toast(err.message, 'error');
      }
      return;
    }
    // guest: add to cart, remove from wishlist
    const ok = await useCartStore.getState().addItem(product, quantity);
    if (ok) {
      const list = loadGuestWishlist().filter((p) => p._id !== product._id);
      saveGuestWishlist(list);
      set({ products: list });
    }
  },

  /** Merge guest wishlist into the server wishlist after login (best-effort). */
  mergeGuestWishlist: async () => {
    const guest = loadGuestWishlist();
    if (!getToken() || guest.length === 0) return;
    for (const p of guest) {
      try {
        await wishlistService.add(p._id);
      } catch {
        /* ignore duplicates / invalid */
      }
    }
    saveGuestWishlist([]);
    await get().hydrate();
  },

  resetForLogout: () => {
    set({ products: loadGuestWishlist(), loaded: true });
  },
}));