/** https only, must look like a real hostname. Returns null if invalid. */
export function cleanUrl(raw: unknown, allowEmpty = false): string | null {
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

const DATA_IMG = /^data:image\/(?:jpeg|webp|png);base64,[A-Za-z0-9+/]+=*$/;

export const AVATAR_MAX = 120_000; // chars of data URL
export const BG_MAX = 700_000;

/**
 * An image is either an https URL or a small base64 data URL (made by the
 * browser's resize step). Returns '' for empty, null for invalid.
 */
export function cleanImage(raw: unknown, maxLen: number): string | null {
  if (raw === undefined || raw === null) return '';
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s) return '';
  if (s.startsWith('data:')) {
    return s.length <= maxLen && DATA_IMG.test(s) ? s : null;
  }
  return cleanUrl(s, true);
}

export const THUMB_MAX = 30_000; // link thumbnails
export const GALLERY_MAX = 70_000; // gallery photos

/**
 * Link icon: '' = auto favicon, 'none', an emoji, or a small image
 * (https URL / uploaded data URL). Returns null if invalid.
 */
export function cleanIcon(raw: unknown): string | null {
  if (raw === undefined || raw === null) return '';
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s || s === 'none') return s;
  if (s.startsWith('data:') || /^https?:\/\//i.test(s)) {
    const r = cleanImage(s, THUMB_MAX);
    return r ? r : null;
  }
  if (s.length <= 16 && /\p{Extended_Pictographic}/u.test(s)) return s;
  return null;
}
