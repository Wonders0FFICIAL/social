import { parseEmbed } from '../embed';
import { DEFAULT_THEME, effectiveTheme, lum } from '../themes';
import type { SocialProfile } from '../types';
import { validUrl } from './controls';

export type Tab = 'start' | 'profile' | 'pages' | 'look' | 'inbox';

export interface Issue {
  id: string;
  /** error = the server would refuse to save, warn = advice */
  level: 'error' | 'warn';
  text: string;
  tab: Tab;
  page?: number;
  block?: string;
}

export const contrast = (a: string, b: string) => {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

/** Everything wrong or improvable on the page. Errors block saving, warnings don't. */
export function lint(p: SocialProfile): Issue[] {
  const out: Issue[] = [];
  const add = (i: Issue) => out.push(i);

  if (!USERNAME_RE.test(p.username)) {
    add({ id: 'username', level: 'error', tab: 'profile', text: 'Choose a username: 3 to 20 letters, numbers or underscores.' });
  }
  if (!p.displayName.trim()) add({ id: 'name', level: 'error', tab: 'profile', text: 'Add a display name.' });
  if (!p.avatarUrl) add({ id: 'avatar', level: 'warn', tab: 'profile', text: 'Add a profile picture so people recognise you.' });

  p.pages.forEach((pg, pi) => {
    const where = pi === 0 ? 'your home page' : `“${pg.title || 'Untitled'}”`;
    if (!pg.title.trim()) add({ id: `pt-${pg.id}`, level: 'error', tab: 'pages', page: pi, text: 'Give every page a name.' });
    const visibleBlocks = pg.blocks.filter((b) => !b.hidden);
    if (pg.blocks.length === 0 && !(pg.hidden && pi > 0)) {
      add({ id: `empty-${pg.id}`, level: 'warn', tab: 'pages', page: pi, text: `${pi === 0 ? 'Your home page is' : `${where} is`} empty. Add a block.` });
    } else if (visibleBlocks.length === 0 && pg.blocks.length > 0 && pi === 0) {
      add({ id: `allhidden-${pg.id}`, level: 'warn', tab: 'pages', page: pi, text: 'Every block on your home page is hidden.' });
    }

    for (const b of pg.blocks) {
      const at = { tab: 'pages' as Tab, page: pi, block: b.id };
      switch (b.type) {
        case 'link':
          if (!b.title.trim()) add({ id: `lt-${b.id}`, level: 'error', ...at, text: `A link on ${where} needs a title.` });
          if (!validUrl(b.url)) {
            add({ id: `lu-${b.id}`, level: 'error', ...at, text: `${b.title ? `“${b.title}”` : 'A link'} on ${where} needs a valid https, mailto: or tel: address.` });
          }
          break;
        case 'socials':
          if (b.items.some((i) => !validUrl(i.url))) {
            add({ id: `su-${b.id}`, level: 'error', ...at, text: `A social icon on ${where} has no valid link.` });
          }
          if (b.items.length === 0) add({ id: `se-${b.id}`, level: 'warn', ...at, text: `The social icons row on ${where} is empty.` });
          break;
        case 'embed':
          if (!parseEmbed(b.url)) add({ id: `eu-${b.id}`, level: 'error', ...at, text: `The video/music block on ${where} needs a YouTube, Instagram, Spotify, TikTok or Vimeo link.` });
          break;
        case 'image':
          if (!b.src) add({ id: `ie-${b.id}`, level: 'warn', ...at, text: `An image block on ${where} has no picture yet.` });
          if (b.url && !validUrl(b.url)) add({ id: `iu-${b.id}`, level: 'error', ...at, text: `An image link on ${where} isn't a valid address.` });
          break;
        case 'gallery':
          if (b.images.length === 0) add({ id: `ge-${b.id}`, level: 'warn', ...at, text: `A gallery on ${where} has no photos yet.` });
          break;
      }
    }

    // readability, using the colours this page is really drawn with
    const t = effectiveTheme(p.theme, pg);
    if (t.bgType !== 'image') {
      const worst = Math.min(contrast(t.textColor, t.bg1), t.bgType === 'gradient' ? contrast(t.textColor, t.bg2) : 99);
      if (worst < 3) add({ id: `ct-${pg.id}`, level: 'warn', tab: pi === 0 || !pg.theme ? 'look' : 'pages', page: pi, text: `Text is hard to read on the background of ${where}.` });
    }
    if (t.btnStyle === 'fill' && contrast(t.btnTextColor, t.btnColor) < 3) {
      add({ id: `cb-${pg.id}`, level: 'warn', tab: pi === 0 || !pg.theme ? 'look' : 'pages', page: pi, text: `Button text is hard to read on its colour on ${where}.` });
    }
  });

  // one tip per global problem is enough
  const seen = new Set<string>();
  return out.filter((i) => {
    const key = i.id.startsWith('ct-') || i.id.startsWith('cb-') ? i.text : i.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export interface Step {
  id: string;
  label: string;
  hint: string;
  done: boolean;
  tab: Tab;
  page?: number;
}

export function checklist(p: SocialProfile, published: boolean): Step[] {
  const goodLinks = p.pages.flatMap((pg) => pg.blocks).filter((b) => b.type === 'link' && b.title.trim() && validUrl(b.url)).length;
  const styled =
    JSON.stringify(p.theme) !== JSON.stringify(DEFAULT_THEME) || p.pages.some((pg) => !!pg.theme);
  return [
    { id: 'photo', label: 'Add a profile picture', hint: 'Upload one or use your Google photo.', done: !!p.avatarUrl, tab: 'profile' },
    { id: 'about', label: 'Write your name and bio', hint: 'A short line about you.', done: !!p.displayName.trim() && !!p.bio.trim(), tab: 'profile' },
    { id: 'links', label: 'Add three links', hint: goodLinks ? `${goodLinks} of 3 added` : 'Paste a link on the Pages tab.', done: goodLinks >= 3, tab: 'pages', page: 0 },
    { id: 'look', label: 'Pick a look', hint: 'Choose a theme or set your own colours.', done: styled, tab: 'look' },
    { id: 'publish', label: 'Publish your page', hint: 'Claim your link and go live.', done: published, tab: 'profile' },
  ];
}

export function ago(ts: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  return `${Math.round(m / 60)} h ago`;
}
