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

/** Link target: https URL, mailto: or tel:. */
export function cleanLinkUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (/^mailto:/i.test(s)) {
    return s.length <= 200 && /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(s) ? s : null;
  }
  if (/^tel:/i.test(s)) {
    return /^tel:\+?[0-9()\-\s]{5,24}$/i.test(s) ? s : null;
  }
  return cleanUrl(s);
}

const DATA_IMG = /^data:image\/(?:jpeg|webp|png);base64,[A-Za-z0-9+/]+=*$/;
/** Images we store ourselves (see api/social/img.ts). */
export const OWN_IMG = /^\/api\/social\/img\?id=[a-f0-9]{24}$/;

export const LEGACY_DATA_MAX = 700_000; // older pages stored small images inline

/**
 * An image is an https URL, one of our own uploads, or (legacy) a small
 * base64 data URL. Returns '' for empty, null for invalid.
 */
export function cleanImage(raw: unknown): string | null {
  if (raw === undefined || raw === null) return '';
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s) return '';
  if (OWN_IMG.test(s)) return s;
  if (s.startsWith('data:')) {
    return s.length <= LEGACY_DATA_MAX && DATA_IMG.test(s) ? s : null;
  }
  return cleanUrl(s, true);
}

const ICON = /^ic:[a-z0-9-]{1,24}$/;

/** '' = auto, 'none', 'ic:<name>' or an image. Null if invalid. */
export function cleanIcon(raw: unknown): string | null {
  if (raw === undefined || raw === null) return '';
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s || s === 'none') return s;
  if (ICON.test(s)) return s;
  // old emoji icons are dropped to "auto"
  if (s.length <= 16 && /\p{Extended_Pictographic}/u.test(s)) return '';
  const img = cleanImage(s);
  return img ? img : null;
}

/** Page icon: '' or ic:<name>. Anything else becomes ''. */
export function cleanPageIcon(raw: unknown): string {
  return typeof raw === 'string' && ICON.test(raw.trim()) ? raw.trim() : '';
}

/** Own image ids referenced anywhere inside a JSON-able value. */
export function ownImageIds(value: unknown): Set<string> {
  const ids = new Set<string>();
  const re = /\/api\/social\/img\?id=([a-f0-9]{24})/g;
  for (const m of JSON.stringify(value).matchAll(re)) ids.add(m[1]);
  return ids;
}
