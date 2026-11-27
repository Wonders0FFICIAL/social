import { ObjectId } from 'mongodb';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clientKey, messages, profiles, rateLimit, upgradePages } from '../_lib/db.js';
import { getSession } from '../_lib/session.js';
import { USERNAME_RE } from '../_lib/validate.js';

// POST   /api/social/contact              public: submit a contact / subscribe form
// GET    /api/social/contact              owner: my inbox
// DELETE /api/social/contact?id=<id>      owner: delete one message  (?all=1 deletes all)

const MAX_INBOX = 2000; // per page owner, keeps the free database healthy
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') {
      const b = req.body ?? {};
      // honeypot: bots fill the hidden "website" field, people never see it
      if (typeof b.website === 'string' && b.website.trim() !== '') {
        return res.status(200).json({ ok: true });
      }

      const username = String(b.username ?? '').toLowerCase();
      if (!USERNAME_RE.test(username)) return res.status(404).json({ error: 'Not found' });

      const email = String(b.email ?? '').trim().slice(0, 200);
      if (!EMAIL.test(email)) return res.status(400).json({ error: 'Enter a valid email address' });

      if (!(await rateLimit(`ct:${clientKey(req)}`, 8, 3600))) {
        return res.status(429).json({ error: 'Too many messages. Try again later.' });
      }

      const profile = await (await profiles()).findOne({ username });
      if (!profile || profile.disabled) return res.status(404).json({ error: 'Not found' });

      const block = upgradePages(profile)
        .flatMap((p) => p.blocks)
        .find((x) => x.id === String(b.blockId) && x.type === 'contact' && !x.hidden);
      if (!block || block.type !== 'contact') return res.status(404).json({ error: 'Form not found' });

      const col = await messages();
      if ((await col.countDocuments({ owner: profile.googleSub })) >= MAX_INBOX) {
        return res.status(503).json({ error: "This inbox is full right now. Please try again later." });
      }

      const message = String(b.message ?? '').trim().slice(0, 2000);
      if (block.mode === 'message' && !message) {
        return res.status(400).json({ error: 'Write a message first' });
      }

      await col.insertOne({
        owner: profile.googleSub,
        username,
        blockId: block.id,
        blockTitle: block.title || (block.mode === 'subscribe' ? 'Subscribe' : 'Contact'),
        email,
        name: String(b.name ?? '').trim().slice(0, 80),
        message,
        createdAt: new Date(),
      });
      return res.status(200).json({ ok: true });
    }

    // owner-only below
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: 'Sign in first' });
    const col = await messages();

    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'private, no-store');
      const list = await col.find({ owner: session.sub }).sort({ createdAt: -1 }).limit(1000).toArray();
      return res.status(200).json({
        messages: list.map((m) => ({
          id: m._id!.toString(),
          blockTitle: m.blockTitle,
          email: m.email,
          name: m.name,
          message: m.message,
          createdAt: m.createdAt,
        })),
      });
    }

    if (req.method === 'DELETE') {
      if (req.query.all === '1') {
        await col.deleteMany({ owner: session.sub });
        return res.status(204).end();
      }
      const id = String(req.query.id ?? '');
      if (!/^[a-f0-9]{24}$/.test(id)) return res.status(400).json({ error: 'Bad id' });
      await col.deleteOne({ _id: new ObjectId(id), owner: session.sub });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
