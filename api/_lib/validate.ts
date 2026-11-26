import { randomUUID } from 'node:crypto';
import type { EmbedDoc, GalleryImageDoc, LinkDoc, PageDoc } from './db.js';
import {
  AVATAR_MAX,
  cleanIcon,
  cleanImage,
  cleanUrl,
  GALLERY_MAX,
} from './clean.js';
import { parseEmbed } from './embed.js';
import { cleanTheme, type Theme } from './theme.js';

// Usernames nobody should be able to claim.
const RESERVED = new Set([
  'edit', 'new', 'admin', 'api', 'login', 'logout', 'signin', 'signup',
  'settings', 'pricing', 'products', 'privacy', 'terms', 'help', 'support',
  'about', 'jr', 'junior', 'official', 'www', 'social', 'me', 'null',
  'undefined', 'root', 'staff', 'moderator', 'mod', 'assets', 'static',
  'home', 'favicon', 'logo', 'robots', 'sitemap', 'explore', 'discover',
]);

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export const MAX_LINKS = 30;
export const MAX_EXTRA_PAGES = 4;
export const MAX_GALLERY = 9;
export const MAX_EMBEDS = 8;
export const MAX_BYTES = 3_800_000; // Vercel's request limit is 4.5 MB

export interface CleanProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: Theme;
  homeTitle: string;
  links: LinkDoc[];
  pages: PageDoc[];
}

type R<T> = { value: T } | { error: string };

function id(raw: unknown): string {
  return String(raw ?? '').replace(/[^\w-]/g, '').slice(0, 36) || randomUUID();
}

function cleanLinks(raw: unknown, where: string): R<LinkDoc[]> {
  if (!Array.isArray(raw)) return { error: `Bad links on ${where}` };
  if (raw.length > MAX_LINKS) return { error: `You can add up to ${MAX_LINKS} links per page` };

  const out: LinkDoc[] = [];
  for (const [i, l] of raw.entries()) {
    const title = String(l?.title ?? '').trim().slice(0, 40);
    if (!title) return { error: `Link ${i + 1} on ${where} needs a title` };
    const url = cleanUrl(l?.url);
    if (!url) return { error: `Link ${i + 1} on ${where} needs a valid https URL` };
    const icon = cleanIcon(l?.icon);
    if (icon === null) {
      return { error: `Link ${i + 1} on ${where} has an invalid icon (use an emoji or an image)` };
    }
    out.push({ id: id(l?.id), title, url, hidden: l?.hidden === true, icon });
  }
  return { value: out };
}

function cleanGallery(raw: unknown, where: string): R<GalleryImageDoc[]> {
  if (raw === undefined || raw === null) return { value: [] };
  if (!Array.isArray(raw)) return { error: `Bad gallery on ${where}` };
  if (raw.length > MAX_GALLERY) return { error: `A gallery can hold up to ${MAX_GALLERY} photos` };

  const out: GalleryImageDoc[] = [];
  for (const [i, g] of raw.entries()) {
    const src = cleanImage(g?.src, GALLERY_MAX);
    if (!src) return { error: `Photo ${i + 1} on ${where} is invalid or too large` };
    out.push({ id: id(g?.id), src, caption: String(g?.caption ?? '').trim().slice(0, 60) });
  }
  return { value: out };
}

function cleanEmbeds(raw: unknown, where: string): R<EmbedDoc[]> {
  if (raw === undefined || raw === null) return { value: [] };
  if (!Array.isArray(raw)) return { error: `Bad showcase on ${where}` };
  if (raw.length > MAX_EMBEDS) return { error: `A showcase can hold up to ${MAX_EMBEDS} items` };

  const out: EmbedDoc[] = [];
  for (const [i, e] of raw.entries()) {
    const url = String(e?.url ?? '').trim();
    if (!parseEmbed(url)) {
      return {
        error: `Showcase item ${i + 1} on ${where} isn't supported. Use YouTube, Instagram, Spotify, TikTok or Vimeo links`,
      };
    }
    out.push({ id: id(e?.id), url });
  }
  return { value: out };
}

function cleanPages(raw: unknown): R<PageDoc[]> {
  if (raw === undefined || raw === null) return { value: [] };
  if (!Array.isArray(raw)) return { error: 'Bad pages' };
  if (raw.length > MAX_EXTRA_PAGES) return { error: `You can add up to ${MAX_EXTRA_PAGES} extra pages` };

  const out: PageDoc[] = [];
  for (const p of raw) {
    const title = String(p?.title ?? '').trim().slice(0, 16);
    if (!title) return { error: 'Every page needs a name' };
    const kind = ['links', 'gallery', 'showcase'].includes(p?.kind) ? p.kind : null;
    if (!kind) return { error: 'Bad page type' };

    const page: PageDoc = { id: id(p?.id), title, kind, links: [], images: [], embeds: [] };
    if (kind === 'links') {
      const r = cleanLinks(p?.links ?? [], `"${title}"`);
      if ('error' in r) return r;
      page.links = r.value;
    } else if (kind === 'gallery') {
      const r = cleanGallery(p?.images, `"${title}"`);
      if ('error' in r) return r;
      page.images = r.value;
    } else {
      const r = cleanEmbeds(p?.embeds, `"${title}"`);
      if ('error' in r) return r;
      page.embeds = r.value;
    }
    out.push(page);
  }
  return { value: out };
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
  const homeTitle = String(body.homeTitle ?? '').trim().slice(0, 16) || 'Links';

  const avatarUrl = cleanImage(body.avatarUrl, AVATAR_MAX);
  if (avatarUrl === null) {
    return { error: 'Avatar must be an https image URL or an uploaded image' };
  }

  const t = cleanTheme(body.theme);
  if ('error' in t) return { error: t.error };

  const links = cleanLinks(body.links, 'your home page');
  if ('error' in links) return { error: links.error };

  const pages = cleanPages(body.pages);
  if ('error' in pages) return { error: pages.error };

  const data: CleanProfile = {
    username,
    displayName,
    bio,
    avatarUrl,
    theme: t.theme,
    homeTitle,
    links: links.value,
    pages: pages.value,
  };

  if (JSON.stringify(data).length > MAX_BYTES) {
    return { error: 'Your page is too large. Remove or shrink some images.' };
  }
  return { data };
}
