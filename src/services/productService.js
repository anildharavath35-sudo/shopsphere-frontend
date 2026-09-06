import api from './api';

export const productService = {
  getProducts(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.set(k, v);
    });
    return api.get(`/products?${query.toString()}`);
  },

  getProduct(id) {
    return api.get(`/products/${id}`);
  },

  getProductReviews(productId, page = 1) {
    return api.get(`/products/${productId}/reviews?page=${page}`);
  },

  addReview(productId, data) {
    return api.post(`/products/${productId}/reviews`, data);
  },

  // Admin
  createProduct(data) {
    return api.post('/products', data);
  },
  updateProduct(id, data) {
    return api.put(`/products/${id}`, data);
  },
  deleteProduct(id) {
    return api.delete(`/products/${id}`);
  },
  uploadProductImages(id, files) {
    const form = new FormData();
    files.forEach((f) => form.append('images', f));
    return api.post(`/products/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const categoryService = {
  getCategories() {
    return api.get('/categories');
  },
  getAll() {
    return api.get('/categories/all');
  },
  create(data) {
    return api.post('/categories', data);
  },
  update(id, data) {
    return api.put(`/categories/${id}`, data);
  },
  remove(id) {
    return api.delete(`/categories/${id}`);
  },
};