import { randomUUID } from 'node:crypto';
import type { LinkDoc } from './db.js';

// Usernames nobody should be able to claim.
const RESERVED = new Set([
  'edit', 'new', 'admin', 'api', 'login', 'logout', 'signin', 'signup',
  'settings', 'pricing', 'products', 'privacy', 'terms', 'help', 'support',
  'about', 'jr', 'junior', 'official', 'www', 'social', 'me', 'null',
  'undefined', 'root', 'staff', 'moderator', 'mod',
]);

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export interface CleanProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  accent: string;
  links: LinkDoc[];
}

/** https only, must look like a real hostname. Returns null if invalid. */
function cleanUrl(raw: unknown, allowEmpty = false): string | null {
  if (typeof raw !== 'string') return null;
  let s = raw.trim();
  if (!s) return allowEmpty ? '' : null;
  if (s.length > 500) return null;
  s = s.replace(/^http:\/\//i, 'https://');
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:') return null;
    if (!u.hostname.includes('.')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function cleanProfile(
  body: any,
): { data: CleanProfile } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Bad request' };

  const username = String(body.username ?? '').trim().toLowerCase();
  if (!USERNAME_RE.test(username)) {
    return { error: 'Username must be 3-20 characters: a-z, 0-9 and underscore' };
  }
  if (RESERVED.has(username)) return { error: 'That username is reserved' };

  const displayName = String(body.displayName ?? '').trim().slice(0, 40);
  if (!displayName) return { error: 'Add a display name' };

  const bio = String(body.bio ?? '').trim().slice(0, 160);

  const avatarUrl = cleanUrl(body.avatarUrl, true);
  if (avatarUrl === null) return { error: 'Avatar must be an https image URL' };

  const accent = /^#[0-9a-f]{6}$/i.test(String(body.accent))
    ? String(body.accent).toLowerCase()
    : '#a855f7';

  if (!Array.isArray(body.links)) return { error: 'Bad links' };
  if (body.links.length > 30) return { error: 'You can add up to 30 links' };

  const links: LinkDoc[] = [];
  for (const [i, l] of body.links.entries()) {
    const title = String(l?.title ?? '').trim().slice(0, 40);
    if (!title) return { error: `Link ${i + 1} needs a title` };
    const url = cleanUrl(l?.url);
    if (!url) return { error: `Link ${i + 1} needs a valid https URL` };
    const id = String(l?.id ?? '').slice(0, 36) || randomUUID();
    links.push({ id, title, url });
  }

  return { data: { username, displayName, bio, avatarUrl, accent, links } };
}
