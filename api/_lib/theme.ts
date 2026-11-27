import { cleanImage } from './clean.js';

export interface Theme {
  bgType: 'solid' | 'gradient' | 'image';
  bg1: string;
  bg2: string;
  bgAngle: number;
  bgImage: string;
  bgDim: number; // 0-80, % black overlay on the background image
  textColor: string;
  btnStyle: 'fill' | 'outline' | 'soft';
  btnShape: 'square' | 'rounded' | 'pill';
  btnColor: string;
  btnTextColor: string;
  btnBorder: string; // '' = same as btnColor
  btnShadow: 'none' | 'soft' | 'hard';
  font: 'sans' | 'serif' | 'mono' | 'rounded';
  avatarShape: 'circle' | 'rounded' | 'square';
  headerAlign: 'center' | 'left';
  spacing: 'compact' | 'normal' | 'airy';
  nav: 'bottom' | 'dock' | 'top';
  navLabels: 'text' | 'icons' | 'both';
  anim: 'none' | 'lift' | 'pop';
}

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

const HEX = /^#[0-9a-f]{6}$/i;

function hex(v: unknown, fallback: string): string {
  return typeof v === 'string' && HEX.test(v) ? v.toLowerCase() : fallback;
}
function pick<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback;
}
function int(v: unknown, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/** Validates + fills defaults. Only a bad background image is an error. */
export function cleanTheme(raw: any): { theme: Theme } | { error: string } {
  const r = raw && typeof raw === 'object' ? raw : {};
  const D = DEFAULT_THEME;

  const bgImage = cleanImage(r.bgImage);
  if (bgImage === null) {
    return { error: 'Background image must be an https URL or an uploaded image' };
  }

  return {
    theme: {
      bgType: pick(r.bgType, ['solid', 'gradient', 'image'] as const, D.bgType),
      bg1: hex(r.bg1, D.bg1),
      bg2: hex(r.bg2, D.bg2),
      bgAngle: int(r.bgAngle, 0, 360, D.bgAngle),
      bgImage,
      bgDim: int(r.bgDim, 0, 80, D.bgDim),
      textColor: hex(r.textColor, D.textColor),
      btnStyle: pick(r.btnStyle, ['fill', 'outline', 'soft'] as const, D.btnStyle),
      btnShape: pick(r.btnShape, ['square', 'rounded', 'pill'] as const, D.btnShape),
      btnColor: hex(r.btnColor, D.btnColor),
      btnTextColor: hex(r.btnTextColor, D.btnTextColor),
      btnBorder: r.btnBorder === '' ? '' : hex(r.btnBorder, D.btnBorder),
      btnShadow: pick(r.btnShadow, ['none', 'soft', 'hard'] as const, D.btnShadow),
      font: pick(r.font, ['sans', 'serif', 'mono', 'rounded'] as const, D.font),
      avatarShape: pick(r.avatarShape, ['circle', 'rounded', 'square'] as const, D.avatarShape),
      headerAlign: pick(r.headerAlign, ['center', 'left'] as const, D.headerAlign),
      spacing: pick(r.spacing, ['compact', 'normal', 'airy'] as const, D.spacing),
      nav: pick(r.nav, ['bottom', 'dock', 'top'] as const, D.nav),
      navLabels: pick(r.navLabels, ['text', 'icons', 'both'] as const, D.navLabels),
      anim: pick(r.anim, ['none', 'lift', 'pop'] as const, D.anim),
    },
  };
}
