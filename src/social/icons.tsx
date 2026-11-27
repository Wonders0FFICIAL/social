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
  FaAndroid, FaAt, FaBasketball, FaBeerMugEmpty, FaBell, FaBicycle, FaBitcoin, FaBlogger, FaBrain, FaBuilding, FaBurger, FaCalendarCheck, FaCar, FaCat, FaChartLine, FaChrome, FaCircleDollarToSlot, FaCircleInfo, FaClapperboard, FaClock, FaCompactDisc, FaCookieBite, FaCrown, FaDeezer, FaDocker, FaDog, FaDropbox, FaEthereum, FaFilm, FaFire, FaFirefoxBrowser, FaFlask, FaFlickr, FaFutbol, FaGem, FaGoogle, FaGoogleDrive, FaGuitar, FaHandHoldingHeart, FaHashtag, FaHeadphones, FaHouse, FaItchIo, FaJs, FaLaptopCode, FaLastfm, FaLeaf, FaLine, FaLinux, FaMap, FaMeta, FaMicrosoft, FaMobileScreen, FaMoneyBillWave, FaMoon, FaNodeJs, FaPaintbrush, FaPenNib, FaPeopleGroup, FaPlane, FaPlaystation, FaPodcast, FaPrint, FaPython, FaQrcode, FaReact, FaRobot, FaRust, FaSafari, FaScaleBalanced, FaScissors, FaSeedling, FaServer, FaShopify, FaStripe, FaSun, FaTag, FaTerminal, FaTicket, FaTrophy, FaTumblr, FaUnity, FaUser, FaUsers, FaViber, FaWandMagicSparkles, FaWeixin, FaWindows, FaWordpress, FaXbox,
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
  { name: 'tumblr', label: 'Tumblr', Cmp: FaTumblr, group: 'brand', hosts: ['tumblr.com'] },
  { name: 'flickr', label: 'Flickr', Cmp: FaFlickr, group: 'brand', hosts: ['flickr.com'] },
  { name: 'lastfm', label: 'Last.fm', Cmp: FaLastfm, group: 'brand', hosts: ['last.fm'] },
  { name: 'deezer', label: 'Deezer', Cmp: FaDeezer, group: 'brand', hosts: ['deezer.com'] },
  { name: 'google', label: 'Google', Cmp: FaGoogle, group: 'brand', hosts: ['google.com'] },
  { name: 'gdrive', label: 'Google Drive', Cmp: FaGoogleDrive, group: 'brand', hosts: ['drive.google.com'] },
  { name: 'dropbox', label: 'Dropbox', Cmp: FaDropbox, group: 'brand', hosts: ['dropbox.com'] },
  { name: 'shopify', label: 'Shopify', Cmp: FaShopify, group: 'brand', hosts: ['shopify.com','myshopify.com'] },
  { name: 'stripe', label: 'Stripe', Cmp: FaStripe, group: 'brand', hosts: ['stripe.com','buy.stripe.com'] },
  { name: 'wordpress', label: 'WordPress', Cmp: FaWordpress, group: 'brand', hosts: ['wordpress.com','wordpress.org'] },
  { name: 'blogger', label: 'Blogger', Cmp: FaBlogger, group: 'brand', hosts: ['blogger.com','blogspot.com'] },
  { name: 'viber', label: 'Viber', Cmp: FaViber, group: 'brand', hosts: ['viber.com'] },
  { name: 'line', label: 'LINE', Cmp: FaLine, group: 'brand', hosts: ['line.me'] },
  { name: 'wechat', label: 'WeChat', Cmp: FaWeixin, group: 'brand', hosts: ['weixin.qq.com','wechat.com'] },
  { name: 'docker', label: 'Docker', Cmp: FaDocker, group: 'brand', hosts: ['docker.com','hub.docker.com'] },
  { name: 'python', label: 'Python', Cmp: FaPython, group: 'brand', hosts: ['python.org','pypi.org'] },
  { name: 'react', label: 'React', Cmp: FaReact, group: 'brand', hosts: ['react.dev','reactjs.org'] },
  { name: 'js', label: 'JavaScript', Cmp: FaJs, group: 'brand' },
  { name: 'nodejs', label: 'Node.js', Cmp: FaNodeJs, group: 'brand', hosts: ['nodejs.org'] },
  { name: 'rust', label: 'Rust', Cmp: FaRust, group: 'brand', hosts: ['rust-lang.org','crates.io'] },
  { name: 'unity', label: 'Unity', Cmp: FaUnity, group: 'brand', hosts: ['unity.com'] },
  { name: 'itch', label: 'itch.io', Cmp: FaItchIo, group: 'brand', hosts: ['itch.io'] },
  { name: 'xbox', label: 'Xbox', Cmp: FaXbox, group: 'brand', hosts: ['xbox.com'] },
  { name: 'playstation', label: 'PlayStation', Cmp: FaPlaystation, group: 'brand', hosts: ['playstation.com'] },
  { name: 'meta', label: 'Meta', Cmp: FaMeta, group: 'brand', hosts: ['meta.com'] },
  { name: 'microsoft', label: 'Microsoft', Cmp: FaMicrosoft, group: 'brand', hosts: ['microsoft.com'] },
  { name: 'windows', label: 'Windows', Cmp: FaWindows, group: 'brand' },
  { name: 'android', label: 'Android', Cmp: FaAndroid, group: 'brand' },
  { name: 'linux', label: 'Linux', Cmp: FaLinux, group: 'brand' },
  { name: 'chrome', label: 'Chrome', Cmp: FaChrome, group: 'brand', hosts: ['chromewebstore.google.com'] },
  { name: 'firefox', label: 'Firefox', Cmp: FaFirefoxBrowser, group: 'brand', hosts: ['mozilla.org','addons.mozilla.org'] },
  { name: 'safari', label: 'Safari', Cmp: FaSafari, group: 'brand' },
  { name: 'chart', label: 'Growth', Cmp: FaChartLine, group: 'general' },
  { name: 'film', label: 'Film', Cmp: FaFilm, group: 'general' },
  { name: 'headphones', label: 'Listen', Cmp: FaHeadphones, group: 'general' },
  { name: 'guitar', label: 'Guitar', Cmp: FaGuitar, group: 'general' },
  { name: 'brush', label: 'Art', Cmp: FaPaintbrush, group: 'general' },
  { name: 'pen', label: 'Writing', Cmp: FaPenNib, group: 'general' },
  { name: 'scissors', label: 'Scissors', Cmp: FaScissors, group: 'general' },
  { name: 'home', label: 'Home', Cmp: FaHouse, group: 'general' },
  { name: 'plane', label: 'Travel', Cmp: FaPlane, group: 'general' },
  { name: 'car', label: 'Car', Cmp: FaCar, group: 'general' },
  { name: 'bike', label: 'Bike', Cmp: FaBicycle, group: 'general' },
  { name: 'football', label: 'Football', Cmp: FaFutbol, group: 'general' },
  { name: 'basketball', label: 'Basketball', Cmp: FaBasketball, group: 'general' },
  { name: 'dog', label: 'Dog', Cmp: FaDog, group: 'general' },
  { name: 'cat', label: 'Cat', Cmp: FaCat, group: 'general' },
  { name: 'leaf', label: 'Nature', Cmp: FaLeaf, group: 'general' },
  { name: 'sun', label: 'Sun', Cmp: FaSun, group: 'general' },
  { name: 'moon', label: 'Moon', Cmp: FaMoon, group: 'general' },
  { name: 'fire', label: 'Fire', Cmp: FaFire, group: 'general' },
  { name: 'trophy', label: 'Trophy', Cmp: FaTrophy, group: 'general' },
  { name: 'crown', label: 'Crown', Cmp: FaCrown, group: 'general' },
  { name: 'gem', label: 'Gem', Cmp: FaGem, group: 'general' },
  { name: 'sparkles', label: 'Sparkles', Cmp: FaWandMagicSparkles, group: 'general' },
  { name: 'info', label: 'Info', Cmp: FaCircleInfo, group: 'general' },
  { name: 'qr', label: 'QR code', Cmp: FaQrcode, group: 'general' },
  { name: 'print', label: 'Print', Cmp: FaPrint, group: 'general' },
  { name: 'legal', label: 'Legal', Cmp: FaScaleBalanced, group: 'general' },
  { name: 'users', label: 'Community', Cmp: FaUsers, group: 'general' },
  { name: 'user', label: 'Person', Cmp: FaUser, group: 'general' },
  { name: 'bell', label: 'Bell', Cmp: FaBell, group: 'general' },
  { name: 'tag', label: 'Tag', Cmp: FaTag, group: 'general' },
  { name: 'ticket', label: 'Tickets', Cmp: FaTicket, group: 'general' },
  { name: 'booked', label: 'Booking', Cmp: FaCalendarCheck, group: 'general' },
  { name: 'clock', label: 'Clock', Cmp: FaClock, group: 'general' },
  { name: 'map', label: 'Map', Cmp: FaMap, group: 'general' },
  { name: 'building', label: 'Company', Cmp: FaBuilding, group: 'general' },
  { name: 'seedling', label: 'Growing', Cmp: FaSeedling, group: 'general' },
  { name: 'disc', label: 'Music disc', Cmp: FaCompactDisc, group: 'general' },
  { name: 'clapper', label: 'Clapperboard', Cmp: FaClapperboard, group: 'general' },
  { name: 'podcast', label: 'Podcast', Cmp: FaPodcast, group: 'general' },
  { name: 'burger', label: 'Burger', Cmp: FaBurger, group: 'general' },
  { name: 'cookie', label: 'Cookie', Cmp: FaCookieBite, group: 'general' },
  { name: 'beer', label: 'Drinks', Cmp: FaBeerMugEmpty, group: 'general' },
  { name: 'mobile', label: 'App', Cmp: FaMobileScreen, group: 'general' },
  { name: 'laptop', label: 'Dev', Cmp: FaLaptopCode, group: 'general' },
  { name: 'terminal', label: 'Terminal', Cmp: FaTerminal, group: 'general' },
  { name: 'server', label: 'Server', Cmp: FaServer, group: 'general' },
  { name: 'robot', label: 'Robot', Cmp: FaRobot, group: 'general' },
  { name: 'brain', label: 'Brain', Cmp: FaBrain, group: 'general' },
  { name: 'flask', label: 'Science', Cmp: FaFlask, group: 'general' },
  { name: 'donate', label: 'Donate', Cmp: FaHandHoldingHeart, group: 'general' },
  { name: 'team', label: 'Team', Cmp: FaPeopleGroup, group: 'general' },
  { name: 'hashtag', label: 'Hashtag', Cmp: FaHashtag, group: 'general' },
  { name: 'at', label: 'At sign', Cmp: FaAt, group: 'general' },
  { name: 'tip', label: 'Tip jar', Cmp: FaCircleDollarToSlot, group: 'general' },
  { name: 'money', label: 'Money', Cmp: FaMoneyBillWave, group: 'general' },
  { name: 'bitcoin', label: 'Bitcoin', Cmp: FaBitcoin, group: 'brand' },
  { name: 'ethereum', label: 'Ethereum', Cmp: FaEthereum, group: 'brand' },
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
