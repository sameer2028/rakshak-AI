import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

/**
 * Axios instance with JWT interceptor.
 * All API calls go through this client.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rakshak_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('rakshak_token');
      localStorage.removeItem('rakshak_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
