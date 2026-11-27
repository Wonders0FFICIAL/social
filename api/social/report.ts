import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clientKey, profiles, rateLimit, reports } from '../_lib/db.js';
import { USERNAME_RE } from '../_lib/validate.js';

export const REASONS = ['spam', 'impersonation', 'harmful', 'adult', 'copyright', 'other'] as const;

// POST /api/social/report  { username, reason, details }   (public)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const b = req.body ?? {};
    const username = String(b.username ?? '').toLowerCase();
    if (!USERNAME_RE.test(username)) return res.status(404).json({ error: 'Not found' });

    const reason = REASONS.includes(b.reason) ? String(b.reason) : 'other';
    const details = String(b.details ?? '').trim().slice(0, 500);

    const ip = clientKey(req);
    if (!(await rateLimit(`rp:${ip}`, 6, 3600))) {
      return res.status(429).json({ error: 'Too many reports. Try again later.' });
    }

    const exists = await (await profiles()).findOne({ username }, { projection: { _id: 1 } });
    if (!exists) return res.status(404).json({ error: 'Not found' });

    const col = await reports();
    // one open report per person per page
    const dupe = await col.findOne({ username, ipHash: ip, status: 'open' });
    if (!dupe) {
      await col.insertOne({ username, reason, details, ipHash: ip, status: 'open', createdAt: new Date() });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
