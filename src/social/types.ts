export interface SocialLink {
  id: string;
  title: string;
  url: string;
}

export interface SocialProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  accent: string;
  links: SocialLink[];
}

export interface Me {
  signedIn: boolean;
  name?: string;
  picture?: string;
  profile?: SocialProfile | null;
}
