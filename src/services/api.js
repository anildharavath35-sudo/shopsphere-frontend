import axios from 'axios';
import { getToken } from '../utils/storage';

/**
 * Central Axios instance.
 * - baseURL '/api' by default (Vite proxies /api to the Express server in dev)
 * - when VITE_API_URL is set (e.g. Vercel -> Render), requests go there directly
 * - attaches the JWT from storage on every request
 * - unwraps { success, message, data } responses
 * - normalizes errors into a friendly { message, code, status }
 */
const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Something went wrong. Please try again.';
    let code = 'NETWORK_ERROR';
    let status = error.response?.status || 0;

    if (error.code === 'ECONNABORTED') {
      message = 'The request took too long. Check your connection.';
    } else if (!error.response) {
      message = 'Cannot reach the server. Make sure the backend is running.';
      code = 'NETWORK_ERROR';
    } else {
      const data = error.response.data;
      status = error.response.status;
      if (status >= 500 && (!data || typeof data !== 'object')) {
        message = 'The server is unavailable. Please try again in a moment.';
        code = 'SERVER_UNAVAILABLE';
      } else {
        message = data?.message || message;
        code = data?.code || 'REQUEST_FAILED';
      }
    }

    // Session expired / invalid token -> force re-login everywhere
    if (
      status === 401 &&
      code !== 'INVALID_CREDENTIALS' &&
      code !== 'WRONG_PASSWORD' &&
      !error.config?.url?.includes('/auth/')
    ) {
      import('../store/authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().logout(false);
      });
    }

    return Promise.reject({ message, code, status });
  }
);

export default api;