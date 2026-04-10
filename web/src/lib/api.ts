import axios from 'axios';
import { apiData } from './api-helpers';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const lang = localStorage.getItem('i18nextLng') || 'tr';
  config.params = { ...config.params, lang };
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const data = apiData<{ accessToken?: string; refreshToken?: string }>(response);
          if (!data?.accessToken || !data?.refreshToken) throw new Error('Invalid refresh response');
          useAuthStore.getState().setTokens(
            data.accessToken,
            data.refreshToken
          );
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        }
      } catch {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
