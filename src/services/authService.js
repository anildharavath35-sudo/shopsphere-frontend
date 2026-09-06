import api from './api';
import { setToken, setStoredUser, clearSession } from '../utils/storage';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    this._persist(res.data);
    return res.data;
  },

  async login(email, password, mergeCart) {
    const res = await api.post('/auth/login', { email, password, mergeCart });
    this._persist(res.data);
    return res.data;
  },

  async me() {
    const res = await api.get('/auth/me');
    if (res.data.user) {
      setStoredUser(res.data.user);
    }
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/auth/profile', data);
    if (res.data.user) setStoredUser(res.data.user);
    return res.data;
  },

  async changePassword(data) {
    const res = await api.put('/auth/change-password', data);
    if (res.data.token) setToken(res.data.token);
    return res.data;
  },

  logout() {
    clearSession();
  },

  _persist(data) {
    if (data.token) setToken(data.token);
    if (data.user) setStoredUser(data.user);
  },
};