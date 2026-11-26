import type { Me, SocialProfile } from './types';

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const data = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) throw new Error(data?.error || `Request failed (${r.status})`);
  return data as T;
}

export const api = {
  me: () => req<Me>('/api/social/me'),
  login: (credential: string) =>
    req<{ ok: true }>('/api/social/auth', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),
  logout: () => req<null>('/api/social/auth', { method: 'DELETE' }),
  get: (username: string) =>
    req<{ profile: SocialProfile }>(
      `/api/social/profile?username=${encodeURIComponent(username)}`,
    ),
  save: (profile: SocialProfile) =>
    req<{ profile: SocialProfile }>('/api/social/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
};
