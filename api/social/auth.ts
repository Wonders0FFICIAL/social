import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth2Client } from 'google-auth-library';
import { profiles, toPublic } from '../_lib/db.js';
import { clearSession, createSession } from '../_lib/session.js';

const google = new OAuth2Client();

// POST   /api/social/auth  { credential }  -> verify Google sign-in, set cookie
// DELETE /api/social/auth                   -> sign out
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'DELETE') {
    clearSession(req, res);
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const credential = req.body?.credential;
  if (typeof credential !== 'string') {
    return res.status(400).json({ error: 'Missing credential' });
  }

  let payload;
  try {
    const ticket = await google.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ error: 'Invalid Google sign-in' });
  }
  if (!payload?.sub) return res.status(401).json({ error: 'Invalid Google sign-in' });

  try {
    await createSession(req, res, {
      sub: payload.sub,
      name: payload.name,
      picture: payload.picture,
      email: payload.email_verified ? payload.email : undefined,
    });
    const doc = await (await profiles()).findOne({ googleSub: payload.sub });
    return res.status(200).json({ ok: true, profile: doc ? toPublic(doc) : null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
