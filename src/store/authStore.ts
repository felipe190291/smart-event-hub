import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  updateTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, token, refreshToken) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refresh_token', refreshToken);
        set({ user, token, refreshToken, isAuthenticated: true });
      },
      updateTokens: (token, refreshToken) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refresh_token', refreshToken);
        set({ token, refreshToken });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
