import { MongoClient, type Collection, type ObjectId } from 'mongodb';
import { cleanTheme, DEFAULT_THEME, type Theme } from './theme.js';

export interface LinkDoc {
  id: string;
  title: string;
  url: string;
  hidden?: boolean;
}

export interface ProfileDoc {
  _id?: ObjectId;
  googleSub: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme?: Theme;
  links: LinkDoc[];
  disabled?: boolean; // set to true in Atlas to hide/ban a profile
  createdAt: Date;
  updatedAt: Date;
}

let clientPromise: Promise<MongoClient> | undefined;
let indexed = false;

export async function profiles(): Promise<Collection<ProfileDoc>> {
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
  const col = client
    .db(process.env.MONGODB_DB || 'jr')
    .collection<ProfileDoc>('social_profiles');

  if (!indexed) {
    await col.createIndex({ username: 1 }, { unique: true });
    await col.createIndex({ googleSub: 1 }, { unique: true });
    indexed = true;
  }
  return col;
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
    links: doc.links.map((l) => ({ ...l, hidden: l.hidden === true })),
  };
}
