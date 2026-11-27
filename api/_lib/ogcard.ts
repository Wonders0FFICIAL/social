import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import type { Theme } from './theme.js';

const require = createRequire(import.meta.url);

function loadFont(file: string): Buffer {
  const rel = `@fontsource/inter/files/${file}`;
  const tries = [
    () => require.resolve(rel),
    () => path.join(process.cwd(), 'node_modules', rel),
  ];
  for (const t of tries) {
    try {
      return readFileSync(t());
    } catch {
      /* try next */
    }
  }
  throw new Error(`font not found: ${file}`);
}

let fonts: { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[] | undefined;
function getFonts() {
  fonts ??= [
    { name: 'Inter', data: loadFont('inter-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Inter', data: loadFont('inter-latin-700-normal.woff'), weight: 700, style: 'normal' },
  ];
  return fonts;
}

const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><path fill="#fff" d="M24 12H40A12 12 0 0 1 52 24V34A12 12 0 0 1 40 46H33L22 55V46H24A12 12 0 0 1 12 34V24A12 12 0 0 1 24 12Z"/><rect x="20" y="21" width="24" height="5" rx="2.5" fill="#2563eb"/><rect x="20" y="29" width="24" height="5" rx="2.5" fill="#2563eb" opacity=".65"/><rect x="20" y="37" width="15" height="5" rx="2.5" fill="#2563eb" opacity=".35"/></svg>`;
const LOGO_URI = `data:image/svg+xml;base64,${Buffer.from(LOGO).toString('base64')}`;

function rgba(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export interface OgInput {
  username: string;
  displayName: string;
  bio: string;
  theme: Theme;
  /** data: URI of the avatar, or '' to draw the initial instead */
  avatar: string;
  host: string;
}

export async function renderOgCard(p: OgInput): Promise<Buffer> {
  const t = p.theme;
  const background =
    t.bgType === 'gradient' ? `linear-gradient(${t.bgAngle}deg, ${t.bg1}, ${t.bg2})` : t.bg1;
  const radius = { circle: 120, rounded: 56, square: 16 }[t.avatarShape];
  const name = clip(p.displayName || p.username, 26);

  const avatar = p.avatar
    ? {
        type: 'img',
        props: { src: p.avatar, width: 240, height: 240, style: { width: 240, height: 240, borderRadius: radius, objectFit: 'cover' } },
      }
    : {
        type: 'div',
        props: {
          style: {
            width: 240,
            height: 240,
            borderRadius: radius,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 110,
            fontWeight: 700,
            background: rgba(t.textColor, 0.16),
          },
          children: (name[0] || '?').toUpperCase(),
        },
      };

  // satori sizes boxes as content-box, so the padding is a margin on an inner box
  const inner = {
    width: 1056,
    height: 486,
    margin: 72,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const tree = {
    type: 'div',
    props: {
      style: { width: 1200, height: 630, display: 'flex', background, color: t.textColor, fontFamily: 'Inter' },
      children: {
        type: 'div',
        props: {
          style: inner,
          children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center' },
            children: [
              { type: 'img', props: { src: LOGO_URI, width: 52, height: 52, style: { width: 52, height: 52 } } },
              { type: 'div', props: { style: { marginLeft: 16, fontSize: 36, fontWeight: 700, opacity: 0.9 }, children: 'social' } },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center' },
            children: [
              avatar,
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', marginLeft: 56, width: 760 },
                  children: [
                    { type: 'div', props: { style: { fontSize: 76, fontWeight: 700, lineHeight: 1.05 }, children: name } },
                    { type: 'div', props: { style: { fontSize: 38, marginTop: 10, opacity: 0.7 }, children: `@${p.username}` } },
                    ...(p.bio
                      ? [{ type: 'div', props: { style: { fontSize: 34, marginTop: 22, lineHeight: 1.3, opacity: 0.88 }, children: clip(p.bio, 90) } }]
                      : []),
                  ],
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex' },
            children: {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  padding: '14px 28px',
                  borderRadius: 999,
                  fontSize: 30,
                  fontWeight: 700,
                  background: rgba(t.textColor, 0.14),
                },
                children: `${p.host}/${p.username}`,
              },
            },
          },
        },
          ],
        },
      },
    },
  };

  const svg = await satori(tree as any, { width: 1200, height: 630, fonts: getFonts() });
  return Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
}
