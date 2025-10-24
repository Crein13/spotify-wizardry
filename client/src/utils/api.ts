import type { GenresApiResponse } from '../types/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export async function fetchGenres(accessToken: string, timeRange: string): Promise<GenresApiResponse> {
  const res = await fetch(`${BACKEND_URL}/api/spotify/genres`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, timeRange }),
  });
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
}

export async function fetchWrapped(accessToken: string, timeRange: string) {
  const res = await fetch(`${BACKEND_URL}/api/spotify/wrapped?time_range=${timeRange}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch wrapped');
  return res.json();
}

export async function logout() {
  await fetch(`${BACKEND_URL}/api/spotify/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function fetchHouseDetails() {
  const res = await fetch(`${BACKEND_URL}/api/spotify/houses`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch house details');
  return res.json();
}
