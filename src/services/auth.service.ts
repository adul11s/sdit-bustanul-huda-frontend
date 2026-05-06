import type { AuthUser, LoginCredentials, RegisterData, ChangePasswordData } from '../interfaces/auth.types';

const API_BASE = '/api/auth';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    return data.data;
  }

  async register(data: RegisterData): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const response = await res.json();
    if (!res.ok) {
      throw new Error(response.error || 'Registration failed');
    }
    return response.data;
  }

  async getProfile(): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch profile');
    }
    return data.data;
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    const res = await fetch(`${API_BASE}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const response = await res.json();
    if (!res.ok) {
      throw new Error(response.error || 'Password change failed');
    }
  }

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  }
}

export const authService = new AuthService();
