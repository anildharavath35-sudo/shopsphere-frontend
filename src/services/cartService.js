import api from './api';

export const cartService = {
  get() {
    return api.get('/cart');
  },
  add(productId, quantity = 1) {
    return api.post('/cart', { productId, quantity });
  },
  update(productId, quantity) {
    return api.put(`/cart/${productId}`, { quantity });
  },
  remove(productId) {
    return api.delete(`/cart/${productId}`);
  },
  clear() {
    return api.delete('/cart');
  },
};

export const wishlistService = {
  get() {
    return api.get('/wishlist');
  },
  add(productId) {
    return api.post('/wishlist', { productId });
  },
  remove(productId) {
    return api.delete(`/wishlist/${productId}`);
  },
  moveToCart(productId, quantity = 1) {
    return api.post(`/wishlist/${productId}/move-to-cart`, { quantity });
  },
};