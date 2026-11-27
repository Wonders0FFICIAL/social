import { ObjectId, Binary } from 'mongodb';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { images, rateLimit } from '../_lib/db.js';
import { getSession } from '../_lib/session.js';

// GET  /api/social/img?id=<hex24>   -> the image bytes (public, cached forever)
// POST /api/social/img              -> upload one image (needs sign-in)
//      body: { mime: 'image/jpeg' | 'image/png' | 'image/webp', data: <base64> }
//      -> { url: '/api/social/img?id=...', size }
//
// Images are resized in the browser first, so a typical upload is 100-500 KB.
// Each account gets a storage quota (default 20 MB) so the free Atlas tier
// (512 MB total) is not eaten by one person.

const MAX_FILE = 2_000_000;
const QUOTA = Number(process.env.USER_IMAGE_QUOTA_MB || 20) * 1024 * 1024;

function sniff(buf: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 12 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const id = String(req.query.id ?? '');
      if (!/^[a-f0-9]{24}$/.test(id)) return res.status(404).end();

      const doc = await (await images()).findOne({ _id: new ObjectId(id) });
      if (!doc) return res.status(404).end();

      res.setHeader('Content-Type', doc.mime);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
      return res.status(200).send(Buffer.from(doc.data.buffer));
    }

    if (req.method === 'POST') {
      const session = await getSession(req);
      if (!session) return res.status(401).json({ error: 'Sign in first' });

      if (!(await rateLimit(`up:${session.sub}`, 120, 3600))) {
        return res.status(429).json({ error: 'Too many uploads. Try again later.' });
      }

      const data = req.body?.data;
      if (typeof data !== 'string' || data.length > MAX_FILE * 1.4) {
        return res.status(413).json({ error: 'Image is too large' });
      }
      const buf = Buffer.from(data, 'base64');
      if (buf.length === 0 || buf.length > MAX_FILE) {
        return res.status(413).json({ error: 'Image is too large' });
      }
      const mime = sniff(buf);
      if (!mime) return res.status(400).json({ error: 'Unsupported image type' });

      const col = await images();
      const used = await col
        .aggregate<{ total: number }>([
          { $match: { owner: session.sub } },
          { $group: { _id: null, total: { $sum: '$size' } } },
        ])
        .toArray();
      if ((used[0]?.total ?? 0) + buf.length > QUOTA) {
        return res.status(413).json({
          error: `Storage full (${Math.round(QUOTA / 1048576)} MB). Delete some images you no longer use.`,
        });
      }

      const _id = new ObjectId();
      await col.insertOne({
        _id,
        owner: session.sub,
        mime,
        data: new Binary(buf),
        size: buf.length,
        createdAt: new Date(),
      });
      return res.status(200).json({ url: `/api/social/img?id=${_id.toString()}`, size: buf.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
