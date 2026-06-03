import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string, refreshToken?: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  verifyToken: () => boolean;
  getAuthHeader: () => { Authorization: string } | {};
}

const decodeToken = (token: string): { exp?: number } | null => {
  try {
    return jwtDecode<{ exp?: number; iat?: number }>(token);
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      setAuth: (user, token, refreshToken) => {
        const decoded = decodeToken(token);
        const now = Math.floor(Date.now() / 1000);

        if (!decoded) {
          console.warn('Token inválido, no se pudo decodificar');
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
          return false;
        }

        if (decoded.exp && decoded.exp < now) {
          console.warn('Token expirado al recibirlo');
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
          return false;
        }

        set({ user, token, refreshToken: refreshToken ?? null, isAuthenticated: true });
        return true;
      },
      logout: () => {
        // Limpiar también el storage del navegador
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('trainer-auth-storage');
          } catch {
            // ignore
          }
        }
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },
      setLoading: (isLoading) => set({ isLoading }),
      verifyToken: () => {
        const { token } = get();
        if (!token) return false;

        const decoded = decodeToken(token);
        if (!decoded) return false;

        const now = Math.floor(Date.now() / 1000);
        return decoded.exp ? decoded.exp > now : false;
      },
      getAuthHeader: () => {
        const { token } = get();
        if (!token) return {};
        return { Authorization: `Bearer ${token}` };
      },
    }),
    {
      name: 'trainer-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
