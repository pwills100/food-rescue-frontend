const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://foodrescue.vote40andfabulousnaija.com';

export async function fetchFromApi(endpoint: string, options?: RequestInit) {
  const res = `${API_BASE}${endpoint}`;
  return fetch(res, options);
}