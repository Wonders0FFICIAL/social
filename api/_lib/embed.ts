export type Provider = 'youtube' | 'instagram' | 'spotify' | 'tiktok' | 'vimeo';

export interface EmbedInfo {
  provider: Provider;
  id: string;
  src: string;
  /** fixed iframe height in px; undefined = use 16:9 */
  height?: number;
  /** max width in px for narrow (portrait) embeds; centred in the phone */
  width?: number;
  /** portrait 9:16 video (YouTube Shorts) */
  vertical?: boolean;
  /** not embeddable: render as a link card instead (e.g. an Instagram profile) */
  card?: boolean;
  /** public page the embed points to */
  href?: string;
  thumb?: string;
}

/**
 * Turns a public share URL into a safe embed. Only these providers are allowed,
 * so users can never make us iframe arbitrary sites.
 * (Same file lives in api/_lib and src/social, keep them identical.)
 */
export function parseEmbed(raw: string): EmbedInfo | null {
  const s = raw.trim();
  if (!s || s.length > 300) return null;
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase().replace(/^(www|m)\./, '');
  const parts = u.pathname.split('/').filter(Boolean);

  if (host === 'youtu.be' || host === 'youtube.com') {
    let id: string | null | undefined;
    if (host === 'youtu.be') id = parts[0];
    else if (parts[0] === 'watch') id = u.searchParams.get('v');
    else if (['shorts', 'embed', 'live', 'v'].includes(parts[0])) id = parts[1];
    if (id && /^[\w-]{11}$/.test(id)) {
      return {
        provider: 'youtube',
        id,
        vertical: parts[0] === 'shorts',
        width: parts[0] === 'shorts' ? 270 : undefined,
        href: `https://www.youtube.com/watch?v=${id}`,
        src: `https://www.youtube-nocookie.com/embed/${id}`,
        thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    }
    return null;
  }

  if (host === 'instagram.com' || host === 'instagr.am') {
    const i = parts.findIndex((p) => ['p', 'reel', 'reels', 'tv'].includes(p));
    const id = i >= 0 ? parts[i + 1] : undefined;
    if (id && /^[\w-]{5,}$/.test(id)) {
      const kind = parts[i] === 'reels' ? 'reel' : parts[i];
      return {
        provider: 'instagram',
        id,
        src: `https://www.instagram.com/${kind}/${id}/embed`,
        height: kind === 'reel' || kind === 'tv' ? 640 : 600,
        width: 360,
        href: `https://www.instagram.com/${kind}/${id}/`,
      };
    }
    // profile link: can't be embedded, shown as a follow card
    if (parts.length === 1 && /^[A-Za-z0-9._]{1,30}$/.test(parts[0]) && !['explore', 'accounts', 'direct', 'stories', 'p', 'reel', 'reels'].includes(parts[0])) {
      return { provider: 'instagram', id: parts[0], src: '', card: true, href: `https://www.instagram.com/${parts[0]}/` };
    }
    return null;
  }

  if (host === 'open.spotify.com') {
    const p = parts[0]?.startsWith('intl-') ? parts.slice(1) : parts;
    const [kind, id] = p;
    if (
      ['track', 'album', 'playlist', 'episode', 'show', 'artist'].includes(kind) &&
      id &&
      /^[A-Za-z0-9]{10,30}$/.test(id)
    ) {
      return {
        provider: 'spotify',
        id,
        src: `https://open.spotify.com/embed/${kind}/${id}`,
        height: kind === 'track' || kind === 'episode' ? 152 : 352,
      };
    }
    return null;
  }

  if (host === 'tiktok.com') {
    const i = parts.indexOf('video');
    const id = i >= 0 ? parts[i + 1] : undefined;
    if (id && /^\d{8,25}$/.test(id)) {
      return { provider: 'tiktok', id, src: `https://www.tiktok.com/embed/v2/${id}`, height: 575, width: 340, href: `https://www.tiktok.com${u.pathname}` };
    }
    return null;
  }

  if (host === 'vimeo.com') {
    const id = parts.find((p) => /^\d+$/.test(p));
    if (id) return { provider: 'vimeo', id, src: `https://player.vimeo.com/video/${id}` };
    return null;
  }

  return null;
}
