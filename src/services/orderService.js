import api from './api';

export const orderService = {
  create(data) {
    return api.post('/orders', data);
  },
  myOrders() {
    return api.get('/orders/my-orders');
  },
  getOrder(id) {
    return api.get(`/orders/${id}`);
  },
  cancelOrder(id, reason) {
    return api.put(`/orders/${id}/cancel`, { reason });
  },
};

export const addressService = {
  getAll() {
    return api.get('/addresses');
  },
  create(data) {
    return api.post('/addresses', data);
  },
  update(id, data) {
    return api.put(`/addresses/${id}`, data);
  },
  remove(id) {
    return api.delete(`/addresses/${id}`);
  },
};

export const paymentService = {
  createOrder(orderId) {
    return api.post('/payment/create-order', { orderId });
  },
  verify({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, devSimulate }) {
    return api.post('/payment/verify', {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      devSimulate,
    });
  },
};