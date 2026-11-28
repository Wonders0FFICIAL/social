import type { CSSProperties } from 'react';
import type { PageTheme, Theme } from './types';

export const DEFAULT_THEME: Theme = {
  bgType: 'solid',
  bg1: '#f4f4f5',
  bg2: '#e4e4e7',
  bgAngle: 160,
  bgImage: '',
  bgDim: 0,
  bgPattern: 'none',
  textColor: '#18181b',
  btnStyle: 'fill',
  btnShape: 'rounded',
  btnColor: '#18181b',
  btnTextColor: '#ffffff',
  btnBorder: '',
  btnShadow: 'none',
  font: 'sans',
  avatarShape: 'circle',
  headerAlign: 'center',
  spacing: 'normal',
  nav: 'bottom',
  navLabels: 'text',
  anim: 'lift',
};

export const FONTS: Record<Theme['font'], string> = {
  sans: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  rounded: "Nunito, ui-rounded, 'SF Pro Rounded', system-ui, sans-serif",
  grotesk: "'Space Grotesk', Inter, system-ui, sans-serif",
  poppins: "Poppins, Inter, system-ui, sans-serif",
  display: "'DM Serif Display', Georgia, serif",
  script: "Caveat, 'Segoe Script', cursive",
};

export const PAGE_THEME_KEYS = [
  'bgType', 'bg1', 'bg2', 'bgAngle', 'bgImage', 'bgDim', 'bgPattern', 'textColor',
  'btnStyle', 'btnShape', 'btnColor', 'btnTextColor', 'btnBorder', 'btnShadow', 'font', 'spacing', 'anim',
] as const;

/** The theme a page is drawn with: global theme + that page's overrides. */
export const effectiveTheme = (t: Theme, page?: { theme?: PageTheme }): Theme =>
  page?.theme ? { ...t, ...page.theme } : t;

/** All overridable keys copied from a theme (starting point for "customise this page"). */
export function snapshotPageTheme(t: Theme): PageTheme {
  const o: Record<string, unknown> = {};
  for (const k of PAGE_THEME_KEYS) o[k] = t[k];
  return o as PageTheme;
}

export const RADIUS = { square: '6px', rounded: '14px', pill: '999px' } as const;
export const CARD_RADIUS = { square: '6px', rounded: '18px', pill: '26px' } as const;
const AVATAR_RADIUS = { circle: '50%', rounded: '24%', square: '8px' } as const;
const GAP = { compact: '8px', normal: '12px', airy: '18px' } as const;

/** Background for solid / gradient themes (image themes are drawn in a layer). */
export function bgCss(t: Theme): string {
  return t.bgType === 'gradient'
    ? `linear-gradient(${t.bgAngle}deg, ${t.bg1}, ${t.bg2})`
    : t.bg1;
}

export function imageLayer(t: Theme): CSSProperties | null {
  if (t.bgType !== 'image' || !t.bgImage) return null;
  const dim = t.bgDim / 100;
  return {
    backgroundImage: `linear-gradient(rgba(0,0,0,${dim}), rgba(0,0,0,${dim})), url(${JSON.stringify(t.bgImage)})`,
  };
}

export function themeVars(t: Theme): CSSProperties {
  return {
    '--text': t.textColor,
    '--btn': t.btnColor,
    '--btn-text': t.btnTextColor,
    '--btn-border': t.btnBorder || t.btnColor,
    '--font': FONTS[t.font],
    '--radius': RADIUS[t.btnShape],
    '--radius-card': CARD_RADIUS[t.btnShape],
    '--avatar-radius': AVATAR_RADIUS[t.avatarShape],
    '--gap': GAP[t.spacing],
    background: bgCss(t),
  } as CSSProperties;
}

export interface Preset {
  name: string;
  /** only colours / button look: layout and navigation settings are never overwritten */
  theme: Partial<Theme>;
}

const base = (t: Partial<Theme>): Partial<Theme> => ({
  bgImage: '',
  bgDim: 0,
  bgPattern: 'none',
  btnBorder: '',
  btnShadow: 'none',
  ...t,
});

export const PRESETS: Preset[] = [
  { name: 'Light', theme: base({ bgType: 'solid', bg1: '#f4f4f5', textColor: '#18181b', btnStyle: 'fill', btnColor: '#18181b', btnTextColor: '#ffffff', btnShape: 'rounded', font: 'sans' }) },
  { name: 'Dark', theme: base({ bgType: 'solid', bg1: '#0a0a0a', textColor: '#fafafa', btnStyle: 'fill', btnColor: '#27272a', btnTextColor: '#fafafa', btnShape: 'rounded', font: 'sans' }) },
  { name: 'Ocean', theme: base({ bgType: 'gradient', bg1: '#0ea5e9', bg2: '#1e3a8a', bgAngle: 160, textColor: '#ffffff', btnStyle: 'fill', btnColor: '#ffffff', btnTextColor: '#0c4a6e', btnShape: 'pill', font: 'sans' }) },
  { name: 'Sunset', theme: base({ bgType: 'gradient', bg1: '#fb923c', bg2: '#db2777', bgAngle: 150, textColor: '#ffffff', btnStyle: 'fill', btnColor: '#ffffff', btnTextColor: '#9d174d', btnShape: 'pill', font: 'rounded' }) },
  { name: 'Forest', theme: base({ bgType: 'gradient', bg1: '#166534', bg2: '#052e16', bgAngle: 170, textColor: '#f0fdf4', btnStyle: 'fill', btnColor: '#bbf7d0', btnTextColor: '#14532d', btnShape: 'rounded', font: 'sans' }) },
  { name: 'Candy', theme: base({ bgType: 'gradient', bg1: '#ddd6fe', bg2: '#fbcfe8', bgAngle: 135, textColor: '#3b0764', btnStyle: 'fill', btnColor: '#ffffff', btnTextColor: '#6d28d9', btnShape: 'pill', font: 'rounded', btnShadow: 'soft' }) },
  { name: 'Paper', theme: base({ bgType: 'solid', bg1: '#fafaf9', textColor: '#1c1917', btnStyle: 'outline', btnColor: '#1c1917', btnTextColor: '#1c1917', btnShape: 'square', font: 'serif' }) },
  { name: 'Midnight', theme: base({ bgType: 'gradient', bg1: '#0f172a', bg2: '#312e81', bgAngle: 160, textColor: '#e2e8f0', btnStyle: 'soft', btnColor: '#818cf8', btnTextColor: '#ffffff', btnShape: 'rounded', font: 'sans' }) },
  { name: 'Terminal', theme: base({ bgType: 'solid', bg1: '#030712', textColor: '#4ade80', btnStyle: 'outline', btnColor: '#4ade80', btnTextColor: '#4ade80', btnShape: 'square', font: 'mono' }) },
  { name: 'Rose', theme: base({ bgType: 'solid', bg1: '#fff1f2', textColor: '#881337', btnStyle: 'fill', btnColor: '#e11d48', btnTextColor: '#ffffff', btnShape: 'pill', font: 'rounded' }) },
  { name: 'Neo', theme: base({ bgType: 'solid', bg1: '#fde047', textColor: '#111111', btnStyle: 'fill', btnColor: '#ffffff', btnTextColor: '#111111', btnBorder: '#111111', btnShadow: 'hard', btnShape: 'square', font: 'sans' }) },
  { name: 'Mint', theme: base({ bgType: 'gradient', bg1: '#ccfbf1', bg2: '#a7f3d0', bgAngle: 160, textColor: '#134e4a', btnStyle: 'fill', btnColor: '#0f766e', btnTextColor: '#ffffff', btnShape: 'rounded', font: 'sans', btnShadow: 'soft' }) },
  { name: 'Slate', theme: base({ bgType: 'solid', bg1: '#1e293b', textColor: '#f1f5f9', btnStyle: 'outline', btnColor: '#94a3b8', btnTextColor: '#f1f5f9', btnShape: 'rounded', font: 'sans' }) },
  { name: 'Peach', theme: base({ bgType: 'gradient', bg1: '#fed7aa', bg2: '#fecdd3', bgAngle: 145, textColor: '#7c2d12', btnStyle: 'fill', btnColor: '#ffffff', btnTextColor: '#9a3412', btnShape: 'pill', font: 'serif', btnShadow: 'soft' }) },
  { name: 'Glass', theme: base({ bgType: 'gradient', bg1: '#6366f1', bg2: '#0ea5e9', bgAngle: 135, textColor: '#ffffff', btnStyle: 'soft', btnColor: '#ffffff', btnTextColor: '#ffffff', btnShape: 'rounded', font: 'sans' }) },
  { name: 'Brutal', theme: base({ bgType: 'solid', bg1: '#ffffff', textColor: '#000000', btnStyle: 'fill', btnColor: '#ff5c8a', btnTextColor: '#000000', btnBorder: '#000000', btnShadow: 'hard', btnShape: 'square', font: 'mono' }) },
  { name: 'Noir', theme: base({ bgType: 'solid', bg1: '#000000', textColor: '#ffffff', btnStyle: 'outline', btnColor: '#ffffff', btnTextColor: '#ffffff', btnShape: 'pill', font: 'grotesk' }) },
  { name: 'Cream', theme: base({ bgType: 'solid', bg1: '#f5efe6', textColor: '#3b2f25', btnStyle: 'fill', btnColor: '#3b2f25', btnTextColor: '#f5efe6', btnShape: 'rounded', font: 'display' }) },
  { name: 'Lavender', theme: base({ bgType: 'gradient', bg1: '#e9d5ff', bg2: '#c7d2fe', bgAngle: 160, textColor: '#2e1065', btnStyle: 'fill', btnColor: '#7c3aed', btnTextColor: '#ffffff', btnShape: 'pill', font: 'poppins', btnShadow: 'soft' }) },
  { name: 'Aurora', theme: base({ bgType: 'gradient', bg1: '#022c22', bg2: '#4c1d95', bgAngle: 145, textColor: '#ecfeff', btnStyle: 'soft', btnColor: '#5eead4', btnTextColor: '#ecfeff', btnShape: 'rounded', font: 'grotesk', bgPattern: 'noise' }) },
  { name: 'Cyber', theme: base({ bgType: 'solid', bg1: '#0b0221', textColor: '#f0abfc', btnStyle: 'outline', btnColor: '#22d3ee', btnTextColor: '#22d3ee', btnShape: 'square', font: 'mono', btnShadow: 'hard', bgPattern: 'grid' }) },
  { name: 'Sand', theme: base({ bgType: 'gradient', bg1: '#fef3c7', bg2: '#fcd9b6', bgAngle: 170, textColor: '#78350f', btnStyle: 'fill', btnColor: '#b45309', btnTextColor: '#fffbeb', btnShape: 'rounded', font: 'serif' }) },
  { name: 'Sky', theme: base({ bgType: 'gradient', bg1: '#e0f2fe', bg2: '#bae6fd', bgAngle: 180, textColor: '#0c4a6e', btnStyle: 'fill', btnColor: '#0284c7', btnTextColor: '#ffffff', btnShape: 'pill', font: 'rounded', btnShadow: 'soft' }) },
  { name: 'Berry', theme: base({ bgType: 'gradient', bg1: '#831843', bg2: '#4a044e', bgAngle: 160, textColor: '#fdf2f8', btnStyle: 'fill', btnColor: '#f9a8d4', btnTextColor: '#500724', btnShape: 'pill', font: 'poppins' }) },
  { name: 'Lime', theme: base({ bgType: 'solid', bg1: '#d9f99d', textColor: '#14532d', btnStyle: 'fill', btnColor: '#14532d', btnTextColor: '#ecfccb', btnShape: 'square', font: 'grotesk', btnShadow: 'hard', btnBorder: '#14532d' }) },
  { name: 'Coffee', theme: base({ bgType: 'solid', bg1: '#292524', textColor: '#e7d5c0', btnStyle: 'fill', btnColor: '#a16207', btnTextColor: '#fefce8', btnShape: 'rounded', font: 'display', bgPattern: 'lines' }) },
  { name: 'Bubblegum', theme: base({ bgType: 'solid', bg1: '#fbcfe8', textColor: '#500724', btnStyle: 'fill', btnColor: '#ffffff', btnTextColor: '#be185d', btnBorder: '#500724', btnShadow: 'hard', btnShape: 'pill', font: 'rounded', bgPattern: 'dots' }) },
  { name: 'Graphite', theme: base({ bgType: 'gradient', bg1: '#3f3f46', bg2: '#18181b', bgAngle: 180, textColor: '#fafafa', btnStyle: 'fill', btnColor: '#fafafa', btnTextColor: '#18181b', btnShape: 'rounded', font: 'sans' }) },
  { name: 'Notebook', theme: base({ bgType: 'solid', bg1: '#fffdf5', textColor: '#1e3a8a', btnStyle: 'outline', btnColor: '#1e3a8a', btnTextColor: '#1e3a8a', btnShape: 'rounded', font: 'script', bgPattern: 'lines' }) },
  { name: 'Ember', theme: base({ bgType: 'gradient', bg1: '#450a0a', bg2: '#ea580c', bgAngle: 200, textColor: '#fff7ed', btnStyle: 'fill', btnColor: '#fff7ed', btnTextColor: '#7c2d12', btnShape: 'pill', font: 'sans' }) },
];

export const SWATCHES = [
  '#ffffff', '#f4f4f5', '#a1a1aa', '#18181b', '#000000', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#ec4899', '#fda4af', '#fde68a', '#bbf7d0',
];

/** One-tap gradient backgrounds */
export const GRADIENTS: [string, string, number][] = [
  ['#fb923c', '#db2777', 150], ['#0ea5e9', '#1e3a8a', 160], ['#22c55e', '#065f46', 160],
  ['#a78bfa', '#ec4899', 135], ['#fde047', '#f97316', 160], ['#0f172a', '#312e81', 160],
  ['#f472b6', '#818cf8', 120], ['#2dd4bf', '#3b82f6', 140], ['#fecdd3', '#fed7aa', 145],
  ['#18181b', '#52525b', 180], ['#f43f5e', '#7c3aed', 150], ['#bef264', '#22d3ee', 140],
];
