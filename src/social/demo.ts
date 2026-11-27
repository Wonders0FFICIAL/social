import { bgCss, DEFAULT_THEME } from './themes';
import type { SocialProfile } from './types';

const tile = (c1: string, c2: string, angle = 135) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" gradientTransform="rotate(${angle} .5 .5)"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/></svg>`,
  )}`;

/** Sample page shown on the home screen. */
export const DEMO_PROFILE: SocialProfile = {
  username: 'maya',
  displayName: 'Maya Chen',
  bio: 'Designer and photographer based in Lisbon.',
  avatarUrl: '',
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
        { id: 'b0', type: 'socials', style: 'outline', items: [
          { id: 's1', icon: '', url: 'https://instagram.com/maya' },
          { id: 's2', icon: '', url: 'https://youtube.com/@maya' },
          { id: 's3', icon: '', url: 'https://github.com/maya' },
          { id: 's4', icon: '', url: 'https://x.com/maya' },
        ] },
        { id: 'b1', type: 'link', variant: 'featured', title: 'New: Lisbon photo series', subtitle: 'Twelve prints, out now', url: 'https://example.com/series', icon: '', image: tile('#fde047', '#f97316', 160) },
        { id: 'b2', type: 'link', variant: 'button', title: 'My portfolio', subtitle: '', url: 'https://example.com', icon: 'ic:palette', image: '' },
        { id: 'b3', type: 'link', variant: 'button', title: 'YouTube channel', subtitle: '', url: 'https://youtube.com', icon: '', image: '' },
        { id: 'b4', type: 'link', variant: 'button', title: 'Print shop', subtitle: '', url: 'https://example.com/shop', icon: 'ic:store', image: '' },
      ],
    },
    {
      id: 'photos',
      title: 'Photos',
      icon: 'ic:camera',
      blocks: [
        { id: 'p1', type: 'heading', text: 'Recent work', subtitle: 'Shot on film, 2026', align: 'center' },
        { id: 'p2', type: 'gallery', layout: 'masonry', images: [
          { id: '1', src: tile('#f97316', '#be185d'), caption: 'Golden hour' },
          { id: '2', src: tile('#06b6d4', '#1d4ed8', 45), caption: 'Coast' },
          { id: '3', src: tile('#84cc16', '#15803d', 200), caption: 'Forest' },
          { id: '4', src: tile('#a78bfa', '#ec4899', 90), caption: 'Dusk' },
          { id: '5', src: tile('#fde047', '#f97316', 160), caption: 'Market' },
          { id: '6', src: tile('#38bdf8', '#0f172a', 20), caption: 'Night' },
        ] },
      ],
    },
    {
      id: 'hello',
      title: 'Hello',
      icon: 'ic:mail',
      blocks: [
        { id: 'h1', type: 'text', align: 'center', text: 'Available for commissions from January. Tell me about your project.' },
        { id: 'h2', type: 'contact', mode: 'message', title: 'Say hello', subtitle: 'I reply within a couple of days.', button: 'Send', success: 'Thanks, talk soon!' },
      ],
    },
  ],
};

export const DEMO_BG = bgCss(DEMO_PROFILE.theme);
