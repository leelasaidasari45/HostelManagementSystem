import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://pg-backend-499c.onrender.com/api'
});

// Setting default credentials so cookies are always passed with requests (fallback)
api.defaults.withCredentials = true;

// Directly intercept requests to append Bearer token for Mobile / Safari persistence
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
