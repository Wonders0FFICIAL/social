import { MongoClient, type Collection, type ObjectId } from 'mongodb';

export interface LinkDoc {
  id: string;
  title: string;
  url: string;
}

export interface ProfileDoc {
  _id?: ObjectId;
  googleSub: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  accent: string;
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
  const client = await clientPromise;
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
  return {
    username: doc.username,
    displayName: doc.displayName,
    bio: doc.bio,
    avatarUrl: doc.avatarUrl,
    accent: doc.accent,
    links: doc.links,
  };
}
