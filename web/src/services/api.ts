const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new ApiError(response.status, `Erro ${response.status}: ${response.statusText}`, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};
