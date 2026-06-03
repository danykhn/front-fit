import api from './api';
import type { LoginResponse, AuthUser } from '@/types';

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

interface VerifyResponse {
  valid: boolean;
  user: AuthUser;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = (await api.post('/auth/login', { email, password })) as unknown as LoginResponse;
    return response;
  },

  async googleAuth(idToken: string): Promise<LoginResponse> {
    const response = (await api.post('/auth/google', { idToken })) as unknown as LoginResponse;
    return response;
  },

  async verifyToken(token: string): Promise<VerifyResponse> {
    try {
      const response = (await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      })) as unknown as VerifyResponse;
      return response;
    } catch {
      return { valid: false, user: null as any };
    }
  },

  async getProfile(): Promise<AuthUser> {
    const response = (await api.get('/auth/profile')) as unknown as AuthUser;
    return response;
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = (await api.get('/auth/me')) as unknown as AuthUser;
    return response;
  },

  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    const response = (await api.post('/auth/refresh', { refreshToken })) as unknown as RefreshResponse;
    return response;
  },
};
