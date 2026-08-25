import type { ApiErrorResponse, AuthResponse } from '@portfolio/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  token?: string;
  _retry?: boolean;
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${cleanPath}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
      return null;
    }

    const json = (await response.json()) as { data: AuthResponse };
    const newAccessToken = json.data.accessToken;
    const newRefreshToken = json.data.refreshToken;

    localStorage.setItem('access_token', newAccessToken);
    if (newRefreshToken) {
      localStorage.setItem('refresh_token', newRefreshToken);
    }
    if (json.data.author) {
      localStorage.setItem('auth_user', JSON.stringify(json.data.author));
    }

    return newAccessToken;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, token, headers, _retry, ...init } = options;
  const url = buildUrl(path, params);

  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  if (!(init.body instanceof FormData) && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  // Attach token if provided or stored
  let authToken = token;
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('access_token') || undefined;
  }
  if (authToken) {
    reqHeaders.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...init,
    headers: reqHeaders,
  });

  if (response.status === 204) {
    return {} as T;
  }

  // Handle 401 unauthorized & auto-refresh
  if (
    response.status === 401 &&
    !_retry &&
    typeof window !== 'undefined' &&
    !path.includes('/auth/login') &&
    !path.includes('/auth/refresh')
  ) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (newToken) {
      return request<T>(path, { ...options, _retry: true, token: newToken });
    }
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorBody = data as ApiErrorResponse | null;
    const code = errorBody?.error?.code || 'UNKNOWN_ERROR';
    const message =
      errorBody?.error?.message || response.statusText || 'An unexpected error occurred';
    const details = errorBody?.error?.details;
    throw new ApiClientError(code, message, response.status, details);
  }

  return data as T;
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return request<T>(path, {
      ...options,
      method: 'POST',
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return request<T>(path, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return request<T>(path, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'DELETE' });
  },

  upload<T>(path: string, formData: FormData, options?: RequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: 'POST',
      body: formData,
    });
  },
};
