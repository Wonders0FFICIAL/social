import type { CSSProperties } from 'react';
import type { Theme } from './types';

export const DEFAULT_THEME: Theme = {
  bgType: 'solid',
  bg1: '#f4f4f5',
  bg2: '#e4e4e7',
  bgAngle: 160,
  bgImage: '',
  bgDim: 0,
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
};

const RADIUS = { square: '6px', rounded: '14px', pill: '999px' } as const;
const CARD_RADIUS = { square: '6px', rounded: '18px', pill: '26px' } as const;
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
];

export const SWATCHES = [
  '#ffffff', '#f4f4f5', '#18181b', '#000000', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];
