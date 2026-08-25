'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { AuthorDto, AuthResponse } from '@portfolio/shared';
import { apiClient } from '@/lib/api';

interface AdminAuthContextType {
  author: AuthorDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  secondsRemaining: number | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  renewSession: () => Promise<void>;
  updateAuthor: (author: AuthorDto) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// 15-minute access token TTL
const DEFAULT_TTL_SECONDS = 15 * 60;

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [author, setAuthor] = useState<AuthorDto | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize from storage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('access_token');
      const storedRefresh = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('auth_user');
      const storedExpiry = localStorage.getItem('token_expires_at');

      if (storedToken && storedRefresh) {
        setAccessToken(storedToken);
        setRefreshToken(storedRefresh);
        if (storedUser) {
          try {
            setAuthor(JSON.parse(storedUser));
          } catch {
            setAuthor(null);
          }
        }

        if (storedExpiry) {
          const expTime = parseInt(storedExpiry, 10);
          const remaining = Math.max(0, Math.floor((expTime - Date.now()) / 1000));
          setSecondsRemaining(remaining);
        } else {
          setSecondsRemaining(DEFAULT_TTL_SECONDS);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!accessToken || secondsRemaining === null) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null || prev <= 0) {
          // Token expired, attempt silent background refresh
          renewSession().catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [accessToken, secondsRemaining]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<{ data: AuthResponse }>('/auth/login', {
        email,
        password,
      });

      const { accessToken: newAccess, refreshToken: newRefresh, author: newAuthor } = res.data;
      const expiresAt = Date.now() + DEFAULT_TTL_SECONDS * 1000;

      localStorage.setItem('access_token', newAccess);
      localStorage.setItem('refresh_token', newRefresh);
      localStorage.setItem('auth_user', JSON.stringify(newAuthor));
      localStorage.setItem('token_expires_at', String(expiresAt));

      setAccessToken(newAccess);
      setRefreshToken(newRefresh);
      setAuthor(newAuthor);
      setSecondsRemaining(DEFAULT_TTL_SECONDS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renewSession = useCallback(async () => {
    const currentRefresh = refreshToken || localStorage.getItem('refresh_token');
    if (!currentRefresh) {
      await logout();
      return;
    }

    try {
      const res = await apiClient.post<{ data: AuthResponse }>('/auth/refresh', {
        refreshToken: currentRefresh,
      });

      const { accessToken: newAccess, refreshToken: newRefresh, author: newAuthor } = res.data;
      const expiresAt = Date.now() + DEFAULT_TTL_SECONDS * 1000;

      localStorage.setItem('access_token', newAccess);
      if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
      if (newAuthor) localStorage.setItem('auth_user', JSON.stringify(newAuthor));
      localStorage.setItem('token_expires_at', String(expiresAt));

      setAccessToken(newAccess);
      if (newRefresh) setRefreshToken(newRefresh);
      if (newAuthor) setAuthor(newAuthor);
      setSecondsRemaining(DEFAULT_TTL_SECONDS);
    } catch {
      await logout();
    }
  }, [refreshToken]);

  const logout = useCallback(async () => {
    const currentRefresh = refreshToken || localStorage.getItem('refresh_token');
    if (currentRefresh) {
      try {
        await apiClient.post('/auth/logout', { refreshToken: currentRefresh });
      } catch {
        // Ignore logout request errors
      }
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token_expires_at');

    setAccessToken(null);
    setRefreshToken(null);
    setAuthor(null);
    setSecondsRemaining(null);

    router.push('/admin/login');
  }, [refreshToken, router]);

  const updateAuthor = useCallback((updatedAuthor: AuthorDto) => {
    setAuthor(updatedAuthor);
    localStorage.setItem('auth_user', JSON.stringify(updatedAuthor));
  }, []);

  const value: AdminAuthContextType = {
    author,
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(accessToken && author),
    isLoading,
    secondsRemaining,
    login,
    logout,
    renewSession,
    updateAuthor,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
