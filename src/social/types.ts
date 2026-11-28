export interface Theme {
  bgType: 'solid' | 'gradient' | 'image';
  bg1: string;
  bg2: string;
  bgAngle: number;
  bgImage: string;
  bgDim: number;
  bgPattern: 'none' | 'dots' | 'grid' | 'lines' | 'noise';
  textColor: string;
  btnStyle: 'fill' | 'outline' | 'soft';
  btnShape: 'square' | 'rounded' | 'pill';
  btnColor: string;
  btnTextColor: string;
  /** '' = same as btnColor */
  btnBorder: string;
  btnShadow: 'none' | 'soft' | 'hard';
  font: 'sans' | 'serif' | 'mono' | 'rounded' | 'grotesk' | 'poppins' | 'display' | 'script';
  avatarShape: 'circle' | 'rounded' | 'square';
  headerAlign: 'center' | 'left';
  spacing: 'compact' | 'normal' | 'airy';
  nav: 'bottom' | 'dock' | 'top';
  navLabels: 'text' | 'icons' | 'both';
  anim: 'none' | 'lift' | 'pop';
}

export type LinkVariant = 'button' | 'card' | 'featured';
export type Align = 'left' | 'center';

interface Base {
  id: string;
  hidden?: boolean;
}
export interface LinkBlock extends Base {
  type: 'link';
  title: string;
  subtitle: string;
  url: string;
  /** '' auto | 'none' | 'ic:<name>' | image url */
  icon: string;
  variant: LinkVariant;
  image: string;
}
export interface HeadingBlock extends Base {
  type: 'heading';
  text: string;
  subtitle: string;
  align: Align;
}
export interface TextBlock extends Base {
  type: 'text';
  text: string;
  align: Align;
}
export interface SocialItem {
  id: string;
  icon: string;
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
export type BlockType = Block['type'];

export interface SocialPage {
  id: string;
  title: string;
  /** '' or 'ic:<name>' */
  icon: string;
  hidden?: boolean;
  blocks: Block[];
}

export interface SocialProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: Theme;
  /** pages[0] is the home page (shows your picture, name and bio) */
  pages: SocialPage[];
}

export interface Me {
  signedIn: boolean;
  name?: string;
  picture?: string;
  admin?: boolean;
  disabled?: boolean;
  profile?: SocialProfile | null;
}

export interface InboxMessage {
  id: string;
  blockTitle: string;
  email: string;
  name: string;
  message: string;
  createdAt: string;
}

export interface AdminReport {
  username: string;
  count: number;
  latest: string;
  reasons: string[];
  details: string[];
  displayName: string | null;
  exists: boolean;
  disabled: boolean;
}
