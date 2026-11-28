import { bgCss, DEFAULT_THEME } from './themes';
import type { SocialProfile } from './types';

/**
 * Sample page shown on the landing page. Every link points at jrofficial.org so
 * the example never sends visitors to a real person's accounts.
 */
const GO = 'https://jrofficial.org/';

const svg = (body: string, w = 400, h = 400) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`,
  )}`;

/** Little landscape illustration: sky gradient, sun, two hills. */
const art = (sky1: string, sky2: string, sun: string, hill1: string, hill2: string, w = 400, h = 400) =>
  svg(
    `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky1}"/><stop offset="1" stop-color="${sky2}"/></linearGradient></defs>` +
      `<rect width="${w}" height="${h}" fill="url(#s)"/>` +
      `<circle cx="${w * 0.68}" cy="${h * 0.36}" r="${Math.min(w, h) * 0.13}" fill="${sun}"/>` +
      `<path d="M0 ${h * 0.78} Q ${w * 0.25} ${h * 0.5} ${w * 0.55} ${h * 0.74} T ${w} ${h * 0.66} V ${h} H0Z" fill="${hill1}"/>` +
      `<path d="M0 ${h * 0.9} Q ${w * 0.3} ${h * 0.68} ${w * 0.62} ${h * 0.88} T ${w} ${h * 0.82} V ${h} H0Z" fill="${hill2}"/>`,
    w,
    h,
  );

const AVATAR = svg(
  `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#f472b6"/></linearGradient></defs>` +
    `<rect width="400" height="400" fill="url(#g)"/>` +
    `<circle cx="200" cy="158" r="74" fill="#7c2d12" opacity=".9"/>` +
    `<path d="M60 400c0-86 62-140 140-140s140 54 140 140z" fill="#7c2d12" opacity=".9"/>` +
    `<circle cx="200" cy="168" r="58" fill="#fed7aa"/>` +
    `<path d="M138 150c8-46 40-62 70-60 34 2 58 24 56 60-18-22-44-30-70-28-24 2-44 10-56 28z" fill="#431407"/>`,
);

export const DEMO_PROFILE: SocialProfile = {
  username: 'maya',
  displayName: 'Maya Chen',
  bio: 'Photographer and designer in Lisbon. Prints, presets and the odd newsletter.',
  avatarUrl: AVATAR,
  theme: {
    ...DEFAULT_THEME,
    bgType: 'gradient',
    bg1: '#fb923c',
    bg2: '#db2777',
    bgAngle: 150,
    textColor: '#ffffff',
    btnStyle: 'fill',
    btnShape: 'pill',
    btnColor: '#ffffff',
    btnTextColor: '#9d174d',
    font: 'rounded',
    btnShadow: 'soft',
    nav: 'dock',
    navLabels: 'both',
  },
  pages: [
    {
      id: 'home',
      title: 'Links',
      icon: 'ic:link',
      blocks: [
        {
          id: 'b0', type: 'socials', style: 'outline',
          items: [
            { id: 's1', icon: 'ic:instagram', url: GO },
            { id: 's2', icon: 'ic:youtube', url: GO },
            { id: 's3', icon: 'ic:tiktok', url: GO },
            { id: 's4', icon: 'ic:x', url: GO },
          ],
        },
        {
          id: 'b1', type: 'link', variant: 'featured', title: 'Lisbon, in 12 frames', subtitle: 'The new print series is out now',
          url: GO, icon: 'ic:camera', image: art('#fde68a', '#fb923c', '#fff7ed', '#c2410c', '#7c2d12', 600, 340),
        },
        { id: 'b2', type: 'link', variant: 'button', title: 'Book a shoot', subtitle: '', url: GO, icon: 'ic:calendar', image: '' },
        { id: 'b3', type: 'link', variant: 'button', title: 'Print shop', subtitle: '', url: GO, icon: 'ic:store', image: '' },
        {
          id: 'b4', type: 'link', variant: 'button', title: 'Lightroom presets', subtitle: 'Free pack', url: GO, icon: 'ic:download', image: '',
          style: { btnStyle: 'fill', btnColor: '#111827', btnTextColor: '#ffffff', btnShape: 'square', btnShadow: 'hard', btnBorder: '#ffffff' },
        },
        { id: 'b5', type: 'link', variant: 'button', title: 'Weekly newsletter', subtitle: '', url: GO, icon: 'ic:mail', image: '' },
      ],
    },
    {
      id: 'photos',
      title: 'Photos',
      icon: 'ic:camera',
      theme: { bgType: 'gradient', bg1: '#0f172a', bg2: '#1e1b4b', bgAngle: 170, textColor: '#e2e8f0', btnColor: '#e2e8f0', btnTextColor: '#0f172a' },
      blocks: [
        { id: 'p1', type: 'heading', text: 'Recent work', subtitle: 'Shot on 35mm, 2026', align: 'left' },
        {
          id: 'p2', type: 'gallery', layout: 'masonry',
          images: [
            { id: '1', src: art('#fde68a', '#fb923c', '#fff7ed', '#c2410c', '#7c2d12', 400, 520), caption: 'Golden hour' },
            { id: '2', src: art('#bae6fd', '#38bdf8', '#fefce8', '#0369a1', '#0c4a6e', 400, 340), caption: 'Coast' },
            { id: '3', src: art('#d9f99d', '#4ade80', '#fefce8', '#15803d', '#14532d', 400, 380), caption: 'Forest' },
            { id: '4', src: art('#c4b5fd', '#f472b6', '#fdf4ff', '#7e22ce', '#581c87', 400, 520), caption: 'Dusk' },
            { id: '5', src: art('#fef08a', '#fdba74', '#ffffff', '#b45309', '#78350f', 400, 340), caption: 'Market' },
            { id: '6', src: art('#475569', '#0f172a', '#e2e8f0', '#1e293b', '#020617', 400, 380), caption: 'Night' },
          ],
        },
        { id: 'p3', type: 'link', variant: 'card', title: 'See the full archive', subtitle: 'Every roll since 2019', url: GO, icon: 'ic:film', image: art('#c4b5fd', '#6366f1', '#e0e7ff', '#4338ca', '#312e81', 600, 340), style: { btnShape: 'rounded' } },
      ],
    },
    {
      id: 'hello',
      title: 'Hello',
      icon: 'ic:mail',
      theme: { bgType: 'solid', bg1: '#fff7ed', textColor: '#7c2d12', btnStyle: 'fill', btnColor: '#c2410c', btnTextColor: '#ffffff', btnShape: 'rounded', font: 'display' },
      blocks: [
        { id: 'h1', type: 'heading', text: 'Say hello', subtitle: 'Commissions open from January', align: 'center' },
        { id: 'h2', type: 'text', align: 'center', text: 'Tell me about your project, your timeline and the mood you are after.' },
        { id: 'h3', type: 'contact', mode: 'message', title: 'Send a message', subtitle: 'I reply within a couple of days.', button: 'Send', success: 'Thanks, talk soon!' },
        { id: 'h4', type: 'divider', style: 'dots' },
        { id: 'h5', type: 'link', variant: 'button', title: 'Or book a call', subtitle: '', url: GO, icon: 'ic:calendar', image: '' },
      ],
    },
  ],
};

export const DEMO_BG = bgCss(DEMO_PROFILE.theme);
