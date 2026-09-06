import api from './api';

export const reviewService = {
  update(id, data) {
    return api.put(`/reviews/${id}`, data);
  },
  remove(id) {
    return api.delete(`/reviews/${id}`);
  },
};

export const adminService = {
  dashboard() {
    return api.get('/admin/dashboard');
  },

  orders(params = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, v);
    });
    return api.get(`/admin/orders?${q.toString()}`);
  },
  getOrder(id) {
    return api.get(`/admin/orders/${id}`);
  },
  updateOrderStatus(id, status, note) {
    return api.put(`/admin/orders/${id}/status`, { status, note });
  },
  updatePaymentStatus(id, paymentStatus) {
    return api.put(`/admin/orders/${id}/payment`, { paymentStatus });
  },

  users(params = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, v);
    });
    return api.get(`/admin/users?${q.toString()}`);
  },
  getUser(id) {
    return api.get(`/admin/users/${id}`);
  },
  updateUserRole(id, role) {
    return api.put(`/admin/users/${id}/role`, { role });
  },
  toggleUserBlock(id, isBlocked) {
    return api.put(`/admin/users/${id}/block`, { isBlocked });
  },
};