import type { VercelRequest, VercelResponse } from '@vercel/node';
import { profiles, toPublic } from '../_lib/db.js';
import { getSession } from '../_lib/session.js';
import { cleanProfile, USERNAME_RE } from '../_lib/validate.js';

// GET /api/social/profile?username=ryan  -> public profile
// PUT /api/social/profile                -> create/update MY profile (needs sign-in)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const username = String(req.query.username ?? '').toLowerCase();
      if (!USERNAME_RE.test(username)) return res.status(404).json({ error: 'Not found' });

      const doc = await (await profiles()).findOne({ username });
      if (!doc || doc.disabled) return res.status(404).json({ error: 'Not found' });

      res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=60');
      return res.status(200).json({ profile: toPublic(doc) });
    }

    if (req.method === 'PUT') {
      const session = await getSession(req);
      if (!session) return res.status(401).json({ error: 'Sign in first' });

      const result = cleanProfile(req.body);
      if ('error' in result) return res.status(400).json({ error: result.error });

      const now = new Date();
      const col = await profiles();
      try {
        await col.updateOne(
          { googleSub: session.sub },
          { $set: { ...result.data, updatedAt: now }, $setOnInsert: { createdAt: now } },
          { upsert: true },
        );
      } catch (e: any) {
        if (e?.code === 11000) return res.status(409).json({ error: 'That username is taken' });
        throw e;
      }

      const doc = await col.findOne({ googleSub: session.sub });
      return res.status(200).json({ profile: doc ? toPublic(doc) : result.data });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
