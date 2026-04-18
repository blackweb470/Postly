// Frontend API utility
// All calls route through the Express backend — the browser never touches Supabase or OpenAI directly.

// If deployed in production, use relative paths so it hits the hosting Express server natively.
// In dev, point to localhost:3001
const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

export function getToken() {
  return localStorage.getItem('postly_token');
}

export function setToken(token) {
  localStorage.setItem('postly_token', token);
}

export function clearToken() {
  localStorage.removeItem('postly_token');
  localStorage.removeItem('postly_user');
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem('postly_user')); } catch { return null; }
}

export function setUser(user) {
  localStorage.setItem('postly_user', JSON.stringify(user));
}

/**
 * Core fetch wrapper — automatically attaches the JWT Bearer token.
 * Throws on non-OK responses with the server's error message.
 */
export async function apiCall(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return res.json();
}
