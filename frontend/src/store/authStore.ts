import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage if available
  const token = localStorage.getItem('token');
  let user = null;
  let isAuthenticated = false;

  if (token) {
    try {
      // Validate token and extract user info
      const decoded = jwtDecode<{ exp: number }>(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp > currentTime) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          user = JSON.parse(storedUser);
          isAuthenticated = true;
        }
      } else {
        // Token expired, clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      // Invalid token, clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading: false,
    error: null,
    login: (token, user) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, error: null });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    },
    clearError: () => set({ error: null }),
  };
});