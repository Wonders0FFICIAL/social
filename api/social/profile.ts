import type { VercelRequest, VercelResponse } from '@vercel/node';
import { images, profiles, toPublic } from '../_lib/db.js';
import { ownImageIds } from '../_lib/clean.js';
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

      const col = await profiles();
      const existing = await col.findOne({ googleSub: session.sub });
      if (existing?.disabled) {
        return res.status(403).json({ error: 'This page has been disabled. Contact support.' });
      }

      const now = new Date();
      try {
        await col.updateOne(
          { googleSub: session.sub },
          {
            $set: { ...result.data, updatedAt: now },
            $unset: { links: '', homeTitle: '' }, // v1 fields
            $setOnInsert: { createdAt: now },
          },
          { upsert: true },
        );
      } catch (e: any) {
        if (e?.code === 11000) return res.status(409).json({ error: 'That username is taken' });
        throw e;
      }

      // Drop uploads this profile no longer uses. The 30 minute grace keeps an
      // image that was uploaded a moment ago but not saved into a block yet.
      try {
        const keep = ownImageIds(result.data);
        const grace = new Date(Date.now() - 30 * 60 * 1000);
        const mine = await (await images())
          .find({ owner: session.sub, createdAt: { $lt: grace } }, { projection: { _id: 1 } })
          .toArray();
        const stale = mine.filter((i) => !keep.has(i._id.toString())).map((i) => i._id);
        if (stale.length) await (await images()).deleteMany({ _id: { $in: stale } });
      } catch (e) {
        console.error('image cleanup failed', e);
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
