import { create } from 'zustand';
import { authApi } from '../api/auth.api';

const useAuthStore = create((set, get) => ({
  // State
  user: JSON.parse(localStorage.getItem('rakshak_user') || 'null'),
  token: localStorage.getItem('rakshak_token') || null,
  isAuthenticated: !!localStorage.getItem('rakshak_token'),
  isLoading: false,
  error: null,

  // Actions
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });
      const { access_token, user } = response.data;

      localStorage.setItem('rakshak_token', access_token);
      localStorage.setItem('rakshak_user', JSON.stringify(user));

      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);
      set({ isLoading: false, error: null });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('rakshak_token');
    localStorage.removeItem('rakshak_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
