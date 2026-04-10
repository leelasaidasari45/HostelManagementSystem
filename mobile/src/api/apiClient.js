import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Set the Backend URL
// During local dev, you must use your machine's LOCAL IP ADDRESS (e.g. 192.168.x.x) 
// because 'localhost' refers to the phone itself.
const LOCAL_IP = '10.10.53.40'; // Update this to your machine's IP
const BASE_URL = `http://${LOCAL_IP}:5001/api`;

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
