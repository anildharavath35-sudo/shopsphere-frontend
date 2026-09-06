import api from './api';

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