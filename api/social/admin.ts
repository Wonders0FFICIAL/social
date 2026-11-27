import type { VercelRequest, VercelResponse } from '@vercel/node';
import { images, messages, profiles, reports } from '../_lib/db.js';
import { getSession, isAdmin } from '../_lib/session.js';
import { USERNAME_RE } from '../_lib/validate.js';

// Admin only (Google accounts listed in the ADMIN_EMAILS env var).
//
// GET  /api/social/admin            -> open reports grouped by page + disabled pages
// GET  /api/social/admin?q=name     -> look up one page
// POST /api/social/admin { action: 'disable' | 'enable' | 'dismiss' | 'delete', username }
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const session = await getSession(req);
    if (!isAdmin(session)) return res.status(403).json({ error: 'Not allowed' });
    res.setHeader('Cache-Control', 'private, no-store');

    const profs = await profiles();
    const reps = await reports();

    if (req.method === 'GET') {
      const q = String(req.query.q ?? '').toLowerCase().trim();
      if (q) {
        const p = USERNAME_RE.test(q) ? await profs.findOne({ username: q }) : null;
        return res.status(200).json({
          found: p ? { username: p.username, displayName: p.displayName, disabled: p.disabled === true } : null,
        });
      }

      const grouped = await reps
        .aggregate<{ _id: string; count: number; latest: Date; reasons: string[]; details: string[] }>([
          { $match: { status: 'open' } },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: '$username',
              count: { $sum: 1 },
              latest: { $first: '$createdAt' },
              reasons: { $push: '$reason' },
              details: { $push: '$details' },
            },
          },
          { $sort: { count: -1, latest: -1 } },
          { $limit: 200 },
        ])
        .toArray();

      const names = grouped.map((g) => g._id);
      const found = await profs
        .find({ username: { $in: names } }, { projection: { username: 1, displayName: 1, disabled: 1 } })
        .toArray();
      const byName = new Map(found.map((p) => [p.username, p]));

      const disabled = await profs
        .find({ disabled: true }, { projection: { username: 1, displayName: 1 } })
        .limit(200)
        .toArray();

      return res.status(200).json({
        reports: grouped.map((g) => ({
          username: g._id,
          count: g.count,
          latest: g.latest,
          reasons: [...new Set(g.reasons)],
          details: g.details.filter(Boolean).slice(0, 5),
          displayName: byName.get(g._id)?.displayName ?? null,
          exists: byName.has(g._id),
          disabled: byName.get(g._id)?.disabled === true,
        })),
        disabled: disabled.map((d) => ({ username: d.username, displayName: d.displayName })),
      });
    }

    if (req.method === 'POST') {
      const username = String(req.body?.username ?? '').toLowerCase();
      if (!USERNAME_RE.test(username)) return res.status(400).json({ error: 'Bad username' });

      switch (req.body?.action) {
        case 'disable':
          await profs.updateOne({ username }, { $set: { disabled: true } });
          await reps.updateMany({ username, status: 'open' }, { $set: { status: 'actioned' } });
          break;
        case 'enable':
          await profs.updateOne({ username }, { $set: { disabled: false } });
          break;
        case 'dismiss':
          await reps.updateMany({ username, status: 'open' }, { $set: { status: 'dismissed' } });
          break;
        case 'delete': {
          const p = await profs.findOne({ username });
          if (p) {
            await (await images()).deleteMany({ owner: p.googleSub });
            await (await messages()).deleteMany({ owner: p.googleSub });
            await profs.deleteOne({ username });
          }
          await reps.updateMany({ username, status: 'open' }, { $set: { status: 'actioned' } });
          break;
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
