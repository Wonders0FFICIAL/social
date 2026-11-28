import { randomUUID } from 'node:crypto';
import { cleanIcon, cleanImage, cleanLinkUrl, cleanPageIcon, cleanUrl } from './clean.js';
import { parseEmbed } from './embed.js';
import { cleanColorOrEmpty, cleanLinkStyle, cleanPageTheme, cleanTheme, type Theme } from './theme.js';
import type { Align, Block, PageDoc } from './types.js';

// Usernames nobody should be able to claim.
const RESERVED = new Set([
  'edit', 'new', 'admin', 'api', 'login', 'logout', 'signin', 'signup',
  'settings', 'pricing', 'products', 'privacy', 'terms', 'help', 'support',
  'about', 'jr', 'junior', 'official', 'www', 'social', 'me', 'null',
  'undefined', 'root', 'staff', 'moderator', 'mod', 'assets', 'static',
  'home', 'favicon', 'logo', 'robots', 'sitemap', 'explore', 'discover',
  'inbox', 'report', 'contact',
]);

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

// These are abuse guards, not product limits. Images live outside the profile
// document (see api/social/img.ts), so the document stays small.
export const MAX_PAGES = 25;
export const MAX_BLOCKS = 400; // per page
export const MAX_ITEMS = 300; // gallery photos / social icons per block
export const MAX_BYTES = 1_500_000;

export interface CleanProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: Theme;
  pages: PageDoc[];
}

type R<T> = { value: T } | { error: string };

const id = (raw: unknown): string =>
  String(raw ?? '').replace(/[^\w-]/g, '').slice(0, 36) || randomUUID();
const str = (raw: unknown, max: number): string => String(raw ?? '').trim().slice(0, max);
const align = (raw: unknown): Align => (raw === 'left' ? 'left' : 'center');
const oneOf = <T extends string>(v: unknown, list: readonly T[], d: T): T =>
  list.includes(v as T) ? (v as T) : d;

function cleanBlock(b: any, where: string): R<Block> {
  if (!b || typeof b !== 'object') return { error: `Bad block on ${where}` };
  const base = { id: id(b.id), hidden: b.hidden === true };

  switch (b.type) {
    case 'link': {
      const title = str(b.title, 60);
      if (!title) return { error: `A link on ${where} needs a title` };
      const url = cleanLinkUrl(b.url);
      if (!url) return { error: `"${title}" needs a valid https, mailto: or tel: link` };
      const icon = cleanIcon(b.icon);
      if (icon === null) return { error: `"${title}" has an invalid icon` };
      const image = cleanImage(b.image);
      if (image === null) return { error: `"${title}" has an invalid image` };
      return {
        value: {
          ...base,
          type: 'link',
          title,
          subtitle: str(b.subtitle, 80),
          url,
          icon,
          variant: oneOf(b.variant, ['button', 'card', 'featured'] as const, 'button'),
          image,
          ...(cleanLinkStyle(b.style) ? { style: cleanLinkStyle(b.style) } : {}),
        },
      };
    }
    case 'heading':
      return {
        value: {
          ...base,
          type: 'heading',
          text: str(b.text, 80),
          subtitle: str(b.subtitle, 200),
          align: align(b.align),
          ...(cleanColorOrEmpty(b.color) ? { color: cleanColorOrEmpty(b.color) } : {}),
        },
      };
    case 'text':
      return {
        value: {
          ...base,
          type: 'text',
          text: String(b.text ?? '').trim().slice(0, 3000),
          align: align(b.align),
          ...(cleanColorOrEmpty(b.color) ? { color: cleanColorOrEmpty(b.color) } : {}),
        },
      };
    case 'socials': {
      if (!Array.isArray(b.items)) return { error: `Bad social icons on ${where}` };
      if (b.items.length > MAX_ITEMS) return { error: 'Too many social icons in one row' };
      const items = [];
      for (const it of b.items) {
        const url = cleanLinkUrl(it?.url);
        if (!url) return { error: `A social icon on ${where} needs a valid link` };
        const icon = cleanPageIcon(it?.icon);
        items.push({ id: id(it?.id), icon, url });
      }
      return {
        value: { ...base, type: 'socials', items, style: oneOf(b.style, ['plain', 'filled', 'outline'] as const, 'filled') },
      };
    }
    case 'gallery': {
      if (!Array.isArray(b.images)) return { error: `Bad gallery on ${where}` };
      if (b.images.length > MAX_ITEMS) return { error: 'Too many photos in one gallery block' };
      const images = [];
      for (const [i, g] of b.images.entries()) {
        const src = cleanImage(g?.src);
        if (!src) return { error: `Photo ${i + 1} on ${where} is invalid` };
        images.push({ id: id(g?.id), src, caption: str(g?.caption, 80) });
      }
      return {
        value: {
          ...base,
          type: 'gallery',
          images,
          layout: oneOf(b.layout, ['grid2', 'grid3', 'carousel', 'masonry'] as const, 'grid2'),
        },
      };
    }
    case 'image': {
      const src = cleanImage(b.src);
      if (src === null) return { error: `An image on ${where} is invalid` };
      const url = b.url ? cleanLinkUrl(b.url) : '';
      if (url === null) return { error: `An image link on ${where} is invalid` };
      return { value: { ...base, type: 'image', src, caption: str(b.caption, 120), url } };
    }
    case 'embed': {
      const url = str(b.url, 300);
      if (!parseEmbed(url)) {
        return { error: `An embed on ${where} isn't supported. Use YouTube, Instagram, Spotify, TikTok or Vimeo links` };
      }
      return { value: { ...base, type: 'embed', url } };
    }
    case 'divider':
      return { value: { ...base, type: 'divider', style: oneOf(b.style, ['line', 'dots', 'space'] as const, 'line') } };
    case 'contact':
      return {
        value: {
          ...base,
          type: 'contact',
          mode: oneOf(b.mode, ['subscribe', 'message'] as const, 'subscribe'),
          title: str(b.title, 60),
          subtitle: str(b.subtitle, 160),
          button: str(b.button, 24) || 'Send',
          success: str(b.success, 120) || 'Thanks! Got it.',
        },
      };
    default:
      return { error: `Unknown block type on ${where}` };
  }
}

function cleanPages(raw: unknown): R<PageDoc[]> {
  if (!Array.isArray(raw) || raw.length === 0) return { error: 'Bad pages' };
  if (raw.length > MAX_PAGES) return { error: `You can have up to ${MAX_PAGES} pages` };

  const pages: PageDoc[] = [];
  for (const [pi, p] of raw.entries()) {
    const title = str(p?.title, 16);
    if (!title) return { error: 'Every page needs a name' };
    if (!Array.isArray(p?.blocks)) return { error: `Page "${title}" is broken` };
    if (p.blocks.length > MAX_BLOCKS) return { error: `Page "${title}" has too many blocks` };

    const blocks: Block[] = [];
    for (const b of p.blocks) {
      const r = cleanBlock(b, `"${title}"`);
      if ('error' in r) return r;
      blocks.push(r.value);
    }
    const pt = cleanPageTheme(p?.theme);
    if ('error' in pt) return { error: pt.error };
    pages.push({
      id: id(p?.id),
      title,
      icon: cleanPageIcon(p?.icon),
      hidden: pi === 0 ? false : p?.hidden === true,
      ...(pt.theme ? { theme: pt.theme } : {}),
      blocks,
    });
  }
  return { value: pages };
}

export function cleanProfile(body: any): { data: CleanProfile } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Bad request' };

  const username = String(body.username ?? '').trim().toLowerCase();
  if (!USERNAME_RE.test(username)) {
    return { error: 'Username must be 3-20 characters: a-z, 0-9 and underscore' };
  }
  if (RESERVED.has(username)) return { error: 'That username is reserved' };

  const displayName = str(body.displayName, 40);
  if (!displayName) return { error: 'Add a display name' };

  const avatarUrl = cleanImage(body.avatarUrl);
  if (avatarUrl === null) return { error: 'Avatar must be an https image URL or an uploaded image' };

  const t = cleanTheme(body.theme);
  if ('error' in t) return { error: t.error };

  const pages = cleanPages(body.pages);
  if ('error' in pages) return { error: pages.error };

  const data: CleanProfile = {
    username,
    displayName,
    bio: str(body.bio, 160),
    avatarUrl,
    theme: t.theme,
    pages: pages.value,
  };

  if (JSON.stringify(data).length > MAX_BYTES) {
    return { error: 'Your page is too large. Remove some inline images or split it across pages.' };
  }
  return { data };
}
