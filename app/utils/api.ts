const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchFromApi(endpoint: string, options?: RequestInit) {
  const res = `${API_BASE}${endpoint}`;
  return fetch(res, options);
}