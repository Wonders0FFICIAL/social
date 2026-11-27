import { ObjectId } from 'mongodb';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { images, profiles, toPublic } from './_lib/db.js';
import { OWN_IMG } from './_lib/clean.js';
import { renderOgCard } from './_lib/ogcard.js';
import { USERNAME_RE } from './_lib/validate.js';

// GET /api/og?u=<username> -> 1200x630 PNG link-preview card
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const username = String(req.query.u ?? '').toLowerCase();
    if (!USERNAME_RE.test(username)) return res.status(404).end();

    const doc = await (await profiles()).findOne({ username });
    if (!doc || doc.disabled) return res.status(404).end();
    const p = toPublic(doc);

    // Only our own stored images (or legacy inline ones) are embedded. We never
    // fetch arbitrary URLs from the server.
    let avatar = '';
    if (OWN_IMG.test(p.avatarUrl)) {
      const id = p.avatarUrl.split('=')[1];
      const img = await (await images()).findOne({ _id: new ObjectId(id) });
      if (img && img.size < 1_500_000) avatar = `data:${img.mime};base64,${Buffer.from(img.data.buffer).toString('base64')}`;
    } else if (/^data:image\/(jpeg|png|webp);base64,/.test(p.avatarUrl)) {
      avatar = p.avatarUrl;
    }

    const png = await renderOgCard({
      username: p.username,
      displayName: p.displayName,
      bio: p.bio,
      theme: p.theme,
      avatar,
      host: String(req.headers['x-forwarded-host'] || req.headers.host || 'social.jrofficial.org'),
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(png);
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
}
