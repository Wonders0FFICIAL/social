import { createHash } from 'node:crypto';
import { MongoClient, type Binary, type Collection, type Db, type ObjectId } from 'mongodb';
import { cleanTheme, DEFAULT_THEME, type Theme } from './theme.js';
import type { Block, PageDoc } from './types.js';

export interface ProfileDoc {
  _id?: ObjectId;
  googleSub: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme?: Theme;
  pages?: any[]; // v2 pages, or old pages with `kind`
  // legacy (v1) fields, removed on next save
  homeTitle?: string;
  links?: any[];
  disabled?: boolean; // hide/ban a profile (admin page or Atlas)
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageDoc {
  _id: ObjectId;
  owner: string; // googleSub
  mime: string;
  data: Binary;
  size: number;
  createdAt: Date;
}

export interface MessageDoc {
  _id?: ObjectId;
  owner: string; // googleSub of the page owner
  username: string;
  blockId: string;
  blockTitle: string;
  email: string;
  name: string;
  message: string;
  createdAt: Date;
}

export interface ReportDoc {
  _id?: ObjectId;
  username: string;
  reason: string;
  details: string;
  ipHash: string;
  status: 'open' | 'dismissed' | 'actioned';
  createdAt: Date;
}

interface RateDoc {
  key: string;
  createdAt: Date;
}

let clientPromise: Promise<MongoClient> | undefined;
let indexed = false;

export async function db(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  clientPromise ??= new MongoClient(uri, { maxPoolSize: 5 }).connect();
  let client: MongoClient;
  try {
    client = await clientPromise;
  } catch (e) {
    clientPromise = undefined; // don't cache a failed connection; retry next request
    throw e;
  }
  const d = client.db(process.env.MONGODB_DB || 'jr');

  if (!indexed) {
    await Promise.all([
      d.collection('social_profiles').createIndex({ username: 1 }, { unique: true }),
      d.collection('social_profiles').createIndex({ googleSub: 1 }, { unique: true }),
      d.collection('social_images').createIndex({ owner: 1 }),
      d.collection('social_messages').createIndex({ owner: 1, createdAt: -1 }),
      d.collection('social_reports').createIndex({ status: 1, username: 1 }),
      d.collection('social_rl').createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }),
      d.collection('social_rl').createIndex({ key: 1, createdAt: -1 }),
    ]);
    indexed = true;
  }
  return d;
}

export const profiles = async (): Promise<Collection<ProfileDoc>> =>
  (await db()).collection<ProfileDoc>('social_profiles');
export const images = async (): Promise<Collection<ImageDoc>> =>
  (await db()).collection<ImageDoc>('social_images');
export const messages = async (): Promise<Collection<MessageDoc>> =>
  (await db()).collection<MessageDoc>('social_messages');
export const reports = async (): Promise<Collection<ReportDoc>> =>
  (await db()).collection<ReportDoc>('social_reports');

/**
 * Allows `max` hits per `windowSec` for a key. Returns false when over the limit.
 * Used to keep forms and uploads from being spammed.
 */
export async function rateLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  const col = (await db()).collection<RateDoc>('social_rl');
  const since = new Date(Date.now() - windowSec * 1000);
  const used = await col.countDocuments({ key, createdAt: { $gt: since } });
  if (used >= max) return false;
  await col.insertOne({ key, createdAt: new Date() });
  return true;
}

export function clientKey(req: { headers: Record<string, string | string[] | undefined> }): string {
  const fwd = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
  const ip = fwd || String(req.headers['x-real-ip'] ?? 'unknown');
  return createHash('sha256')
    .update(ip + (process.env.SESSION_SECRET || ''))
    .digest('hex')
    .slice(0, 16);
}

const uid = () => Math.random().toString(36).slice(2, 12);

/** Turns a v1 profile (links + kind-based pages) into v2 pages of blocks. */
export function upgradePages(doc: ProfileDoc): PageDoc[] {
  const raw = doc.pages ?? [];
  if (raw.length > 0 && Array.isArray(raw[0]?.blocks)) return raw as PageDoc[];

  const linkBlock = (l: any): Block => ({
    id: l.id || uid(),
    type: 'link',
    title: l.title ?? '',
    subtitle: '',
    url: l.url ?? '',
    icon: typeof l.icon === 'string' && (l.icon === 'none' || /^(https:|data:|ic:)/.test(l.icon)) ? l.icon : '',
    variant: 'button',
    image: '',
    hidden: l.hidden === true,
  });

  const pages: PageDoc[] = [
    { id: 'home', title: doc.homeTitle || 'Links', icon: '', hidden: false, blocks: (doc.links ?? []).map(linkBlock) },
  ];
  for (const p of raw) {
    const blocks: Block[] = [];
    if (p.kind === 'links') blocks.push(...(p.links ?? []).map(linkBlock));
    if (p.kind === 'gallery' && (p.images ?? []).length) {
      blocks.push({ id: uid(), type: 'gallery', layout: 'grid2', images: p.images });
    }
    if (p.kind === 'showcase') {
      for (const e of p.embeds ?? []) blocks.push({ id: e.id || uid(), type: 'embed', url: e.url });
    }
    pages.push({ id: p.id || uid(), title: p.title || 'Page', icon: '', hidden: false, blocks });
  }
  return pages;
}

/** What the outside world is allowed to see. */
export function toPublic(doc: ProfileDoc) {
  const t = cleanTheme(doc.theme);
  return {
    username: doc.username,
    displayName: doc.displayName,
    bio: doc.bio,
    avatarUrl: doc.avatarUrl,
    theme: 'theme' in t ? t.theme : DEFAULT_THEME,
    pages: upgradePages(doc),
  };
}
