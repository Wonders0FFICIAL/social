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
}

export interface SocialProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: Theme;
  links: SocialLink[];
}

export interface Me {
  signedIn: boolean;
  name?: string;
  picture?: string;
  profile?: SocialProfile | null;
}
