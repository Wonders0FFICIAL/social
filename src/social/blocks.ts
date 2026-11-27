import type { Block, BlockType, SocialPage, SocialProfile } from './types';

const uid = () => crypto.randomUUID();

export function newBlock(type: BlockType): Block {
  const id = uid();
  switch (type) {
    case 'link':
      return { id, type, title: '', subtitle: '', url: '', icon: '', variant: 'button', image: '' };
    case 'heading':
      return { id, type, text: 'Heading', subtitle: '', align: 'center' };
    case 'text':
      return { id, type, text: '', align: 'center' };
    case 'socials':
      return { id, type, items: [], style: 'filled' };
    case 'gallery':
      return { id, type, images: [], layout: 'grid2' };
    case 'image':
      return { id, type, src: '', caption: '', url: '' };
    case 'embed':
      return { id, type, url: '' };
    case 'divider':
      return { id, type, style: 'line' };
    case 'contact':
      return {
        id,
        type,
        mode: 'subscribe',
        title: 'Stay in touch',
        subtitle: 'Leave your email and I will get back to you.',
        button: 'Send',
        success: 'Thanks! Got it.',
      };
  }
}

export const newPage = (title = 'New page'): SocialPage => ({
  id: uid(),
  title,
  icon: '',
  hidden: false,
  blocks: [],
});

export const EMPTY_PROFILE = (theme: SocialProfile['theme']): SocialProfile => ({
  username: '',
  displayName: '',
  bio: '',
  avatarUrl: '',
  theme,
  pages: [newPage('Links')],
});

export interface BlockMeta {
  type: BlockType;
  label: string;
  desc: string;
}

export const BLOCK_TYPES: BlockMeta[] = [
  { type: 'link', label: 'Link', desc: 'A button, card or banner that opens a page' },
  { type: 'socials', label: 'Social icons', desc: 'A row of icons for your profiles' },
  { type: 'heading', label: 'Heading', desc: 'A title to split your page into sections' },
  { type: 'text', label: 'Text', desc: 'A short paragraph or note' },
  { type: 'gallery', label: 'Photo gallery', desc: 'Grid, carousel or masonry of photos' },
  { type: 'image', label: 'Image', desc: 'One picture, optionally clickable' },
  { type: 'embed', label: 'Video / music', desc: 'YouTube, Instagram, Spotify, TikTok, Vimeo' },
  { type: 'contact', label: 'Contact form', desc: 'Collect emails or messages' },
  { type: 'divider', label: 'Divider', desc: 'A line, dots or empty space' },
];
