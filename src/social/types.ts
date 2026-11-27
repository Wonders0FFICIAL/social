export interface Theme {
  bgType: 'solid' | 'gradient' | 'image';
  bg1: string;
  bg2: string;
  bgAngle: number;
  bgImage: string;
  bgDim: number;
  textColor: string;
  btnStyle: 'fill' | 'outline' | 'soft';
  btnShape: 'square' | 'rounded' | 'pill';
  btnColor: string;
  btnTextColor: string;
  font: 'sans' | 'serif' | 'mono' | 'rounded';
  avatarShape: 'circle' | 'rounded' | 'square';
}

export interface SocialLink {
  id: string;
  title: string;
  url: string;
  hidden?: boolean;
  /** '' = auto favicon | 'none' | emoji | image (https URL / data URL) */
  icon?: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  caption: string;
}

export interface EmbedItem {
  id: string;
  url: string;
}

export type PageKind = 'links' | 'gallery' | 'showcase';

export interface SocialPage {
  id: string;
  title: string;
  kind: PageKind;
  links: SocialLink[];
  images: GalleryImage[];
  embeds: EmbedItem[];
}

export interface SocialProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: Theme;
  homeTitle: string;
  links: SocialLink[];
  pages: SocialPage[];
}

export interface Me {
  signedIn: boolean;
  name?: string;
  picture?: string;
  profile?: SocialProfile | null;
}
