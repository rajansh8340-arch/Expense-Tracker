import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ledgerly_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if checking auth/me initially
      const url = error.config?.url || '';
      if (!url.includes('/auth/me')) {
        localStorage.removeItem('ledgerly_token');
        localStorage.removeItem('ledgerly_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
