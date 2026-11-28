import { cleanImage } from './clean.js';
import type { LinkStyle, PageTheme } from './types.js';

export interface Theme {
  bgType: 'solid' | 'gradient' | 'image';
  bg1: string;
  bg2: string;
  bgAngle: number;
  bgImage: string;
  bgDim: number; // 0-80, % black overlay on the background image
  bgPattern: 'none' | 'dots' | 'grid' | 'lines' | 'noise';
  textColor: string;
  btnStyle: 'fill' | 'outline' | 'soft';
  btnShape: 'square' | 'rounded' | 'pill';
  btnColor: string;
  btnTextColor: string;
  btnBorder: string; // '' = same as btnColor
  btnShadow: 'none' | 'soft' | 'hard';
  font: 'sans' | 'serif' | 'mono' | 'rounded' | 'grotesk' | 'poppins' | 'display' | 'script';
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
      bgPattern: pick(r.bgPattern, ['none', 'dots', 'grid', 'lines', 'noise'] as const, D.bgPattern),
      textColor: hex(r.textColor, D.textColor),
      btnStyle: pick(r.btnStyle, ['fill', 'outline', 'soft'] as const, D.btnStyle),
      btnShape: pick(r.btnShape, ['square', 'rounded', 'pill'] as const, D.btnShape),
      btnColor: hex(r.btnColor, D.btnColor),
      btnTextColor: hex(r.btnTextColor, D.btnTextColor),
      btnBorder: r.btnBorder === '' ? '' : hex(r.btnBorder, D.btnBorder),
      btnShadow: pick(r.btnShadow, ['none', 'soft', 'hard'] as const, D.btnShadow),
      font: pick(r.font, ['sans', 'serif', 'mono', 'rounded', 'grotesk', 'poppins', 'display', 'script'] as const, D.font),
      avatarShape: pick(r.avatarShape, ['circle', 'rounded', 'square'] as const, D.avatarShape),
      headerAlign: pick(r.headerAlign, ['center', 'left'] as const, D.headerAlign),
      spacing: pick(r.spacing, ['compact', 'normal', 'airy'] as const, D.spacing),
      nav: pick(r.nav, ['bottom', 'dock', 'top'] as const, D.nav),
      navLabels: pick(r.navLabels, ['text', 'icons', 'both'] as const, D.navLabels),
      anim: pick(r.anim, ['none', 'lift', 'pop'] as const, D.anim),
    },
  };
}

export const PAGE_THEME_KEYS = [
  'bgType', 'bg1', 'bg2', 'bgAngle', 'bgImage', 'bgDim', 'bgPattern', 'textColor',
  'btnStyle', 'btnShape', 'btnColor', 'btnTextColor', 'btnBorder', 'btnShadow', 'font', 'spacing', 'anim',
] as const;

/**
 * A page can override part of the global theme. Only keys that were sent AND are
 * valid are kept, everything else is inherited.
 */
export function cleanPageTheme(raw: any): { theme: PageTheme | undefined } | { error: string } {
  if (!raw || typeof raw !== 'object') return { theme: undefined };
  const picked: Record<string, unknown> = {};
  for (const k of PAGE_THEME_KEYS) if (k in raw) picked[k] = raw[k];
  if (Object.keys(picked).length === 0) return { theme: undefined };

  const r = cleanTheme({ ...DEFAULT_THEME, ...picked });
  if ('error' in r) return r;
  const out: Record<string, unknown> = {};
  for (const k of PAGE_THEME_KEYS) {
    if (k in picked && (r.theme as any)[k] === picked[k]) out[k] = picked[k];
  }
  // bgImage may be rewritten by cleanImage (e.g. trimmed): keep the cleaned value
  if ('bgImage' in picked) out.bgImage = r.theme.bgImage;
  return { theme: Object.keys(out).length ? (out as PageTheme) : undefined };
}

/** Per-link style: only valid keys survive. */
export function cleanLinkStyle(raw: any): LinkStyle | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o: LinkStyle = {};
  const has = (k: string) => raw[k] !== undefined && raw[k] !== null;
  if (has('btnStyle') && ['fill', 'outline', 'soft'].includes(raw.btnStyle)) o.btnStyle = raw.btnStyle;
  if (has('btnShape') && ['square', 'rounded', 'pill'].includes(raw.btnShape)) o.btnShape = raw.btnShape;
  if (has('btnShadow') && ['none', 'soft', 'hard'].includes(raw.btnShadow)) o.btnShadow = raw.btnShadow;
  if (has('anim') && ['none', 'lift', 'pop'].includes(raw.anim)) o.anim = raw.anim;
  if (has('size') && ['sm', 'md', 'lg'].includes(raw.size)) o.size = raw.size;
  if (has('textAlign') && ['left', 'center'].includes(raw.textAlign)) o.textAlign = raw.textAlign;
  for (const k of ['btnColor', 'btnTextColor', 'btnBorder'] as const) {
    if (typeof raw[k] === 'string' && HEX.test(raw[k])) o[k] = raw[k].toLowerCase();
  }
  return Object.keys(o).length ? o : undefined;
}

/** '' or a #rrggbb colour */
export function cleanColorOrEmpty(v: unknown): string {
  return typeof v === 'string' && HEX.test(v) ? v.toLowerCase() : '';
}
