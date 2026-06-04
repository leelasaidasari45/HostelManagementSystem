import axios from 'axios';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'https://pg-backend-499c.onrender.com';
  
  // If the browser is accessing the website via a local IP (e.g., 192.168.x.x)
  // and VITE_API_URL is configured to point to localhost, we dynamically swap 'localhost' or '127.0.0.1'
  // with the computer's hostname/IP so mobile browsers on the local network can connect successfully.
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      url = url.replace('localhost', hostname).replace('127.0.0.1', hostname);
    }
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 60000, // 60s timeout for Render free-tier cold starts
});

const isNativeApp = typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || window.cordova !== undefined);

// Setting default credentials so cookies are always passed with requests on the Web.
// On Mobile Native apps, we disable this to avoid stubborn ghost sessions across logouts,
// and rely entirely on the Bearer token instead.
api.defaults.withCredentials = !isNativeApp;

// Append Bearer token for Mobile / Safari persistence
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-retry on network errors (handles Render free-tier cold starts)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    // Only retry on network errors or 503/504 (server waking up)
    // Make checks case-insensitive for maximum reliability across browsers/devices
    const errorMsg = error.message?.toLowerCase() || '';
    const isNetworkError = !error.response && (
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      errorMsg.includes('network error') ||
      errorMsg.includes('failed to fetch')
    );
    const isServerBusy = error.response?.status === 503 || error.response?.status === 504;

    if ((isNetworkError || isServerBusy) && !config._retryCount) {
      config._retryCount = 0;
    }

    if ((isNetworkError || isServerBusy) && config._retryCount < 3) {
      config._retryCount += 1;
      const delay = config._retryCount * 5000; // 5s, 10s, 15s
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;

