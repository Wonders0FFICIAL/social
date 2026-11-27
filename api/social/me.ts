import type { VercelRequest, VercelResponse } from '@vercel/node';
import { profiles, toPublic } from '../_lib/db.js';
import { getSession, isAdmin } from '../_lib/session.js';

// GET /api/social/me -> who am I + my profile (if I made one)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'private, no-store');

  try {
    const session = await getSession(req);
    if (!session) return res.status(200).json({ signedIn: false });

    const doc = await (await profiles()).findOne({ googleSub: session.sub });
    return res.status(200).json({
      signedIn: true,
      name: session.name,
      picture: session.picture,
      admin: isAdmin(session),
      disabled: doc?.disabled === true,
      profile: doc ? toPublic(doc) : null,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
