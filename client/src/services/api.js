import axios from 'axios';

/**
 * Normalizes any configured API URL to ensure valid syntax and append '/api' endpoint if omitted.
 * Handles trailing slashes, accidental wrapping quotes, and proxy relative paths.
 */
export const normalizeApiUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim().replace(/^["']|["']$/g, ''); // strip outer quotes if present
  url = url.replace(/\/+$/, ''); // strip trailing slashes

  // If user passed a relative proxy path or root path
  if (url === '/api' || url.endsWith('/api')) {
    return url;
  }

  // If user provided a base host like http://localhost:5000 or https://api.domain.com
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `${url}/api`;
  }

  return url;
};

/**
 * Resolves the active backend API base URL with graceful fallback logic.
 */
export const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const normalized = normalizeApiUrl(envUrl);
    if (normalized) return normalized;
  }

  // Fallback: Detect if running on a live domain vs local environment
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://expense-tracker-server-pink.vercel.app/api';
  }

  return 'http://localhost:5000/api';
};

/**
 * Returns environment and client configuration metadata.
 */
export const getAppConfig = () => ({
  apiUrl: getBaseUrl(),
  rawApiEnv: import.meta.env.VITE_API_URL || '',
  appTitle: import.meta.env.VITE_APP_TITLE || 'Ledgerly — Expense Tracker',
  appEnv: import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development',
  isDemoEnabled: import.meta.env.VITE_ENABLE_DEMO !== 'false',
  isDev: import.meta.env.DEV,
});

/**
 * Performs a live health check ping against the API server and database.
 */
export const checkApiHealth = async () => {
  const startTime = performance.now();
  const currentBaseUrl = getBaseUrl();

  try {
    const res = await api.get('/health', { timeout: 6000 });
    const latencyMs = Math.round(performance.now() - startTime);

    return {
      ok: res.data?.status === 'ok' || res.status === 200,
      status: res.data?.status || 'ok',
      database: res.data?.database || 'connected',
      service: res.data?.service || 'Ledgerly MERN API',
      timestamp: res.data?.timestamp || new Date().toISOString(),
      latencyMs,
      apiUrl: currentBaseUrl,
      error: null,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    const serverMessage = err.response?.data?.message || err.message;
    return {
      ok: false,
      status: 'offline',
      database: 'disconnected',
      service: 'Ledgerly MERN API',
      timestamp: new Date().toISOString(),
      latencyMs,
      apiUrl: currentBaseUrl,
      error: serverMessage || 'Could not connect to API server',
    };
  }
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach JWT bearer token from localStorage
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

// Response interceptor: Handle session expiration or unauthorized requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if checking auth/me during initial startup
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
