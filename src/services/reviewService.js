import api from './api';

export const reviewService = {
  getProductReviews(productId, page = 1) {
    return api.get(`/reviews/product/${productId}?page=${page}`);
  },
  add(productId, data) {
    return api.post(`/reviews/product/${productId}`, data);
  },
  update(id, data) {
    return api.put(`/reviews/${id}`, data);
  },
  remove(id) {
    return api.delete(`/reviews/${id}`);
  },
};