import { bgCss } from './themes';
import type { SocialProfile } from './types';

const tile = (c1: string, c2: string, angle = 135) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" gradientTransform="rotate(${angle} .5 .5)"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/></svg>`,
  )}`;

/** Sample page shown on the home screen. */
export const DEMO_PROFILE: SocialProfile = {
  username: 'maya',
  displayName: 'Maya Chen',
  bio: 'Designer & photographer. Say hi 👋',
  avatarUrl: '',
  homeTitle: 'Links',
  theme: {
    bgType: 'gradient',
    bg1: '#fb923c',
    bg2: '#db2777',
    bgAngle: 150,
    bgImage: '',
    bgDim: 0,
    textColor: '#ffffff',
    btnStyle: 'fill',
    btnShape: 'pill',
    btnColor: '#ffffff',
    btnTextColor: '#9d174d',
    font: 'rounded',
    avatarShape: 'circle',
  },
  links: [
    { id: 'a', title: 'My portfolio', url: 'https://example.com', icon: '🎨' },
    { id: 'b', title: 'Latest photo series', url: 'https://example.com/photos', icon: '📸' },
    { id: 'c', title: 'YouTube channel', url: 'https://youtube.com', icon: '' },
    { id: 'd', title: 'Weekly newsletter', url: 'https://example.com/news', icon: '✉️' },
    { id: 'e', title: 'Print shop', url: 'https://example.com/shop', icon: '🛍️' },
  ],
  pages: [
    {
      id: 'g',
      title: 'Gallery',
      kind: 'gallery',
      links: [],
      embeds: [],
      images: [
        { id: '1', src: tile('#f97316', '#be185d'), caption: 'Golden hour' },
        { id: '2', src: tile('#06b6d4', '#1d4ed8', 45), caption: 'Coast' },
        { id: '3', src: tile('#84cc16', '#15803d', 200), caption: 'Forest' },
        { id: '4', src: tile('#a78bfa', '#ec4899', 90), caption: 'Dusk' },
        { id: '5', src: tile('#fde047', '#f97316', 160), caption: 'Market' },
        { id: '6', src: tile('#38bdf8', '#0f172a', 20), caption: 'Night' },
      ],
    },
    {
      id: 'm',
      title: 'More',
      kind: 'links',
      embeds: [],
      images: [],
      links: [
        { id: 'x', title: 'Book a call', url: 'https://example.com/book', icon: '📅' },
        { id: 'y', title: 'Press kit', url: 'https://example.com/press', icon: '📰' },
      ],
    },
  ],
};

export const DEMO_BG = bgCss(DEMO_PROFILE.theme);
