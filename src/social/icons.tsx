import type { IconType } from 'react-icons';
import {
  FaAmazon, FaApple, FaBagShopping, FaBandcamp, FaBehance, FaBluesky, FaBolt, FaBook,
  FaBriefcase, FaCalendarDays, FaCamera, FaCartShopping, FaCode, FaCodepen, FaComments,
  FaDiscord, FaDownload, FaDribbble, FaDumbbell, FaEnvelope, FaEtsy, FaFacebookF,
  FaFigma, FaFileLines, FaGamepad, FaGift, FaGithub, FaGitlab, FaGlobe, FaGooglePlay,
  FaGraduationCap, FaHandshake, FaHeart, FaInstagram, FaLightbulb, FaLink, FaLinkedinIn,
  FaLocationDot, FaMastodon, FaMedium, FaMicrophone, FaMugHot, FaMusic, FaNewspaper,
  FaNpm, FaPalette, FaPatreon, FaPaw, FaPaypal, FaPhone, FaPinterestP, FaRedditAlien,
  FaRocket, FaShieldHalved, FaSlack, FaSnapchat, FaSoundcloud, FaSpotify, FaStackOverflow,
  FaStar, FaSteam, FaStore, FaTelegram, FaThreads, FaTiktok, FaTwitch, FaUtensils,
  FaVideo, FaVimeoV, FaWhatsapp, FaXTwitter, FaYoutube,
} from 'react-icons/fa6';

export interface IconDef {
  name: string;
  label: string;
  Cmp: IconType;
  group: 'brand' | 'general';
  /** hostnames that auto-pick this icon */
  hosts?: string[];
}

export const ICONS: IconDef[] = [
  // brands
  { name: 'github', label: 'GitHub', Cmp: FaGithub, group: 'brand', hosts: ['github.com'] },
  { name: 'instagram', label: 'Instagram', Cmp: FaInstagram, group: 'brand', hosts: ['instagram.com'] },
  { name: 'youtube', label: 'YouTube', Cmp: FaYoutube, group: 'brand', hosts: ['youtube.com', 'youtu.be'] },
  { name: 'x', label: 'X', Cmp: FaXTwitter, group: 'brand', hosts: ['x.com', 'twitter.com'] },
  { name: 'discord', label: 'Discord', Cmp: FaDiscord, group: 'brand', hosts: ['discord.gg', 'discord.com'] },
  { name: 'tiktok', label: 'TikTok', Cmp: FaTiktok, group: 'brand', hosts: ['tiktok.com'] },
  { name: 'linkedin', label: 'LinkedIn', Cmp: FaLinkedinIn, group: 'brand', hosts: ['linkedin.com'] },
  { name: 'twitch', label: 'Twitch', Cmp: FaTwitch, group: 'brand', hosts: ['twitch.tv'] },
  { name: 'facebook', label: 'Facebook', Cmp: FaFacebookF, group: 'brand', hosts: ['facebook.com', 'fb.com'] },
  { name: 'reddit', label: 'Reddit', Cmp: FaRedditAlien, group: 'brand', hosts: ['reddit.com'] },
  { name: 'spotify', label: 'Spotify', Cmp: FaSpotify, group: 'brand', hosts: ['open.spotify.com', 'spotify.com'] },
  { name: 'telegram', label: 'Telegram', Cmp: FaTelegram, group: 'brand', hosts: ['t.me', 'telegram.me'] },
  { name: 'whatsapp', label: 'WhatsApp', Cmp: FaWhatsapp, group: 'brand', hosts: ['wa.me', 'whatsapp.com'] },
  { name: 'snapchat', label: 'Snapchat', Cmp: FaSnapchat, group: 'brand', hosts: ['snapchat.com'] },
  { name: 'pinterest', label: 'Pinterest', Cmp: FaPinterestP, group: 'brand', hosts: ['pinterest.com'] },
  { name: 'behance', label: 'Behance', Cmp: FaBehance, group: 'brand', hosts: ['behance.net'] },
  { name: 'dribbble', label: 'Dribbble', Cmp: FaDribbble, group: 'brand', hosts: ['dribbble.com'] },
  { name: 'medium', label: 'Medium', Cmp: FaMedium, group: 'brand', hosts: ['medium.com'] },
  { name: 'patreon', label: 'Patreon', Cmp: FaPatreon, group: 'brand', hosts: ['patreon.com'] },
  { name: 'steam', label: 'Steam', Cmp: FaSteam, group: 'brand', hosts: ['steamcommunity.com', 'store.steampowered.com'] },
  { name: 'gitlab', label: 'GitLab', Cmp: FaGitlab, group: 'brand', hosts: ['gitlab.com'] },
  { name: 'npm', label: 'npm', Cmp: FaNpm, group: 'brand', hosts: ['npmjs.com'] },
  { name: 'mastodon', label: 'Mastodon', Cmp: FaMastodon, group: 'brand', hosts: ['mastodon.social'] },
  { name: 'bluesky', label: 'Bluesky', Cmp: FaBluesky, group: 'brand', hosts: ['bsky.app'] },
  { name: 'threads', label: 'Threads', Cmp: FaThreads, group: 'brand', hosts: ['threads.net'] },
  { name: 'soundcloud', label: 'SoundCloud', Cmp: FaSoundcloud, group: 'brand', hosts: ['soundcloud.com'] },
  { name: 'bandcamp', label: 'Bandcamp', Cmp: FaBandcamp, group: 'brand', hosts: ['bandcamp.com'] },
  { name: 'paypal', label: 'PayPal', Cmp: FaPaypal, group: 'brand', hosts: ['paypal.me', 'paypal.com'] },
  { name: 'stackoverflow', label: 'Stack Overflow', Cmp: FaStackOverflow, group: 'brand', hosts: ['stackoverflow.com'] },
  { name: 'codepen', label: 'CodePen', Cmp: FaCodepen, group: 'brand', hosts: ['codepen.io'] },
  { name: 'figma', label: 'Figma', Cmp: FaFigma, group: 'brand', hosts: ['figma.com'] },
  { name: 'vimeo', label: 'Vimeo', Cmp: FaVimeoV, group: 'brand', hosts: ['vimeo.com'] },
  { name: 'apple', label: 'Apple', Cmp: FaApple, group: 'brand', hosts: ['apple.com', 'apps.apple.com'] },
  { name: 'googleplay', label: 'Google Play', Cmp: FaGooglePlay, group: 'brand', hosts: ['play.google.com'] },
  { name: 'amazon', label: 'Amazon', Cmp: FaAmazon, group: 'brand', hosts: ['amazon.com'] },
  { name: 'etsy', label: 'Etsy', Cmp: FaEtsy, group: 'brand', hosts: ['etsy.com'] },
  { name: 'slack', label: 'Slack', Cmp: FaSlack, group: 'brand', hosts: ['slack.com'] },
  // general
  { name: 'link', label: 'Link', Cmp: FaLink, group: 'general' },
  { name: 'globe', label: 'Website', Cmp: FaGlobe, group: 'general' },
  { name: 'mail', label: 'Email', Cmp: FaEnvelope, group: 'general' },
  { name: 'phone', label: 'Phone', Cmp: FaPhone, group: 'general' },
  { name: 'calendar', label: 'Calendar', Cmp: FaCalendarDays, group: 'general' },
  { name: 'cart', label: 'Cart', Cmp: FaCartShopping, group: 'general' },
  { name: 'bag', label: 'Shop', Cmp: FaBagShopping, group: 'general' },
  { name: 'store', label: 'Store', Cmp: FaStore, group: 'general' },
  { name: 'music', label: 'Music', Cmp: FaMusic, group: 'general' },
  { name: 'video', label: 'Video', Cmp: FaVideo, group: 'general' },
  { name: 'camera', label: 'Photos', Cmp: FaCamera, group: 'general' },
  { name: 'mic', label: 'Podcast', Cmp: FaMicrophone, group: 'general' },
  { name: 'briefcase', label: 'Work', Cmp: FaBriefcase, group: 'general' },
  { name: 'file', label: 'Document', Cmp: FaFileLines, group: 'general' },
  { name: 'news', label: 'News', Cmp: FaNewspaper, group: 'general' },
  { name: 'book', label: 'Book', Cmp: FaBook, group: 'general' },
  { name: 'code', label: 'Code', Cmp: FaCode, group: 'general' },
  { name: 'palette', label: 'Design', Cmp: FaPalette, group: 'general' },
  { name: 'gamepad', label: 'Games', Cmp: FaGamepad, group: 'general' },
  { name: 'chat', label: 'Chat', Cmp: FaComments, group: 'general' },
  { name: 'star', label: 'Star', Cmp: FaStar, group: 'general' },
  { name: 'heart', label: 'Heart', Cmp: FaHeart, group: 'general' },
  { name: 'gift', label: 'Gift', Cmp: FaGift, group: 'general' },
  { name: 'coffee', label: 'Coffee', Cmp: FaMugHot, group: 'general', hosts: ['ko-fi.com', 'buymeacoffee.com'] },
  { name: 'pin', label: 'Location', Cmp: FaLocationDot, group: 'general' },
  { name: 'bolt', label: 'Bolt', Cmp: FaBolt, group: 'general' },
  { name: 'rocket', label: 'Rocket', Cmp: FaRocket, group: 'general' },
  { name: 'idea', label: 'Idea', Cmp: FaLightbulb, group: 'general' },
  { name: 'learn', label: 'Learn', Cmp: FaGraduationCap, group: 'general' },
  { name: 'handshake', label: 'Partner', Cmp: FaHandshake, group: 'general' },
  { name: 'shield', label: 'Shield', Cmp: FaShieldHalved, group: 'general' },
  { name: 'download', label: 'Download', Cmp: FaDownload, group: 'general' },
  { name: 'food', label: 'Food', Cmp: FaUtensils, group: 'general' },
  { name: 'fitness', label: 'Fitness', Cmp: FaDumbbell, group: 'general' },
  { name: 'paw', label: 'Pets', Cmp: FaPaw, group: 'general' },
];

const byName = new Map(ICONS.map((i) => [i.name, i]));
const byHost = new Map<string, string>();
for (const i of ICONS) for (const h of i.hosts ?? []) byHost.set(h, i.name);

/** 'ic:github' -> 'github' (null for anything else) */
export function iconName(value: string): string | null {
  return value.startsWith('ic:') ? value.slice(3) : null;
}

export function hostOf(url: string): string {
  try {
    return new URL(/^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** The brand icon for a URL, if we know it. */
export function autoIconFor(url: string): string | null {
  const u = url.trim().toLowerCase();
  if (u.startsWith('mailto:')) return 'mail';
  if (u.startsWith('tel:')) return 'phone';
  const host = hostOf(u);
  if (!host) return null;
  if (byHost.has(host)) return byHost.get(host)!;
  // subdomains, e.g. artist.bandcamp.com or open.spotify.com
  const parts = host.split('.');
  for (let i = 1; i < parts.length - 1; i++) {
    const h = parts.slice(i).join('.');
    if (byHost.has(h)) return byHost.get(h)!;
  }
  return null;
}

export function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const Cmp = byName.get(name)?.Cmp ?? FaLink;
  return <Cmp size={size} className={className} aria-hidden />;
}

export const iconLabel = (name: string) => byName.get(name)?.label ?? name;
