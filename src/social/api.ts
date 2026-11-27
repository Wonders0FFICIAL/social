import type { Me, SocialProfile, InboxMessage, AdminReport } from './types';

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

const post = <T,>(url: string, body: unknown) =>
  req<T>(url, { method: 'POST', body: JSON.stringify(body) });

export const api = {
  me: () => req<Me>('/api/social/me'),
  login: (credential: string) => post<{ ok: true }>('/api/social/auth', { credential }),
  logout: () => req<null>('/api/social/auth', { method: 'DELETE' }),
  get: (username: string) =>
    req<{ profile: SocialProfile }>(`/api/social/profile?username=${encodeURIComponent(username)}`),
  save: (profile: SocialProfile) =>
    req<{ profile: SocialProfile }>('/api/social/profile', { method: 'PUT', body: JSON.stringify(profile) }),

  /** base64 (no prefix) -> stored image url */
  upload: (mime: string, data: string) => post<{ url: string; size: number }>('/api/social/img', { mime, data }),

  contact: (b: {
    username: string;
    blockId: string;
    email: string;
    name?: string;
    message?: string;
    website?: string;
  }) => post<{ ok: true }>('/api/social/contact', b),
  inbox: () => req<{ messages: InboxMessage[] }>('/api/social/contact'),
  deleteMessage: (id: string) => req<null>(`/api/social/contact?id=${id}`, { method: 'DELETE' }),
  clearInbox: () => req<null>('/api/social/contact?all=1', { method: 'DELETE' }),

  report: (b: { username: string; reason: string; details: string }) =>
    post<{ ok: true }>('/api/social/report', b),

  admin: () =>
    req<{ reports: AdminReport[]; disabled: { username: string; displayName: string }[] }>('/api/social/admin'),
  adminFind: (q: string) =>
    req<{ found: { username: string; displayName: string; disabled: boolean } | null }>(
      `/api/social/admin?q=${encodeURIComponent(q)}`,
    ),
  adminAct: (action: 'disable' | 'enable' | 'dismiss' | 'delete', username: string) =>
    post<{ ok: true }>('/api/social/admin', { action, username }),
};
