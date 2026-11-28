// Shared shape of a profile. The client mirrors these in src/social/types.ts.

export type LinkVariant = 'button' | 'card' | 'featured';
export type Align = 'left' | 'center';

import type { Theme } from './theme.js';

/** Per-link look. Every field is optional: missing means "inherit from the page". */
export interface LinkStyle {
  btnStyle?: 'fill' | 'outline' | 'soft';
  btnShape?: 'square' | 'rounded' | 'pill';
  btnColor?: string;
  btnTextColor?: string;
  btnBorder?: string;
  btnShadow?: 'none' | 'soft' | 'hard';
  anim?: 'none' | 'lift' | 'pop';
  size?: 'sm' | 'md' | 'lg';
  textAlign?: 'left' | 'center';
}
/** Per-page overrides of the global theme (colours, background, buttons, font). */
export type PageTheme = Partial<Pick<Theme,
  'bgType' | 'bg1' | 'bg2' | 'bgAngle' | 'bgImage' | 'bgDim' | 'bgPattern' | 'textColor' |
  'btnStyle' | 'btnShape' | 'btnColor' | 'btnTextColor' | 'btnBorder' | 'btnShadow' | 'font' | 'spacing' | 'anim'>>;

interface Base {
  id: string;
  hidden?: boolean;
}

export interface LinkBlock extends Base {
  type: 'link';
  title: string;
  subtitle: string;
  url: string; // https:, mailto: or tel:
  icon: string; // '' auto | 'none' | 'ic:<name>' | image
  variant: LinkVariant;
  image: string; // used by card / featured
  style?: LinkStyle;
}
export interface HeadingBlock extends Base {
  type: 'heading';
  text: string;
  subtitle: string;
  align: Align;
  color?: string; // '' / missing = page text colour
}
export interface TextBlock extends Base {
  type: 'text';
  text: string;
  align: Align;
  color?: string;
}
export interface SocialItem {
  id: string;
  icon: string; // 'ic:<name>'
  url: string;
}
export interface SocialsBlock extends Base {
  type: 'socials';
  items: SocialItem[];
  style: 'plain' | 'filled' | 'outline';
}
export interface GalleryImage {
  id: string;
  src: string;
  caption: string;
}
export interface GalleryBlock extends Base {
  type: 'gallery';
  images: GalleryImage[];
  layout: 'grid2' | 'grid3' | 'carousel' | 'masonry';
}
export interface ImageBlock extends Base {
  type: 'image';
  src: string;
  caption: string;
  url: string;
}
export interface EmbedBlock extends Base {
  type: 'embed';
  url: string;
}
export interface DividerBlock extends Base {
  type: 'divider';
  style: 'line' | 'dots' | 'space';
}
export interface ContactBlock extends Base {
  type: 'contact';
  mode: 'subscribe' | 'message';
  title: string;
  subtitle: string;
  button: string;
  success: string;
}

export type Block =
  | LinkBlock
  | HeadingBlock
  | TextBlock
  | SocialsBlock
  | GalleryBlock
  | ImageBlock
  | EmbedBlock
  | DividerBlock
  | ContactBlock;

export interface PageDoc {
  id: string;
  title: string;
  icon: string; // '' or 'ic:<name>'
  hidden?: boolean;
  theme?: PageTheme;
  blocks: Block[];
}
