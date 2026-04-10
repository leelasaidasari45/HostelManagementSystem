import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Set the Backend URL
// During production, we use the Render URL.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://pg-backend-499c.onrender.com/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Interceptor to attach the JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
