import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthUser, LoginCredentials, RegisterData, ChangePasswordData } from '../interfaces/auth.types';
import { authService } from '../services/auth.service';
import { toast } from 'sonner';

const STORAGE_KEY_USER = 'auth_user';

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(STORAGE_KEY_USER);
  return userStr ? JSON.parse(userStr) : null;
}

function setStoredUser(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}

function clearStoredUser(): void {
  localStorage.removeItem(STORAGE_KEY_USER);
}

export interface IUseAuth {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  changePassword: (data: ChangePasswordData) => Promise<void>;
}

const AuthContext = createContext<IUseAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setStoredUser(response);
      setUser(response);
      setIsLoading(false);
      toast.success(`Welcome back, ${response.name}`);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      setStoredUser(response);
      setUser(response);
      setIsLoading(false);
      toast.success(`Welcome, ${response.name}`);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    clearStoredUser();
    setUser(null);
    window.location.href = '/login';
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordData) => {
    await authService.changePassword(data);
    toast.success('Password changed successfully');
  }, []);

  const value: IUseAuth = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): IUseAuth {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
