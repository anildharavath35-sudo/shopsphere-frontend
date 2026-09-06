import { create } from 'zustand';
import { authService } from '../services/authService';
import { getToken, getStoredUser, clearSession } from '../utils/storage';

export const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: getToken(),
  isAuthenticated: Boolean(getToken()),

  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: Boolean(token || user) });
  },

  setUser: (user) => set({ user }),

  /** Re-fetch the current user profile from the server. */
  fetchMe: async () => {
    if (!get().token) return null;
    try {
      const res = await authService.me();
      set({ user: res.data.user, isAuthenticated: true });
      return res.data.user;
    } catch {
      return null;
    }
  },

  updateUser: async (data) => {
    const res = await authService.updateProfile(data);
    set({ user: res.data.user });
    return res.data;
  },

  logout: (silent = true) => {
    authService.logout();
    clearSession();
    set({ user: null, token: null, isAuthenticated: false });
    if (!silent) {
      import('./cartStore').then(({ useCartStore }) => useCartStore.getState().resetForLogout());
      import('./wishlistStore').then(({ useWishlistStore }) => useWishlistStore.getState().resetForLogout());
    }
  },
}));

export const isAdmin = () => useAuthStore.getState().user?.role === 'admin';
export const isLoggedIn = () => useAuthStore.getState().isAuthenticated;