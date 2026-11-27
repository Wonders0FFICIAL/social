import type { VercelRequest, VercelResponse } from '@vercel/node';
import { profiles } from './_lib/db.js';
import { USERNAME_RE } from './_lib/validate.js';

// Link-preview crawlers (Discord, X, Slack, WhatsApp, ...) don't run JavaScript, so
// vercel.json sends *only their requests* for /<username> here. People get the normal app.
// GET /api/page?u=<username> -> tiny HTML page with Open Graph / Twitter tags
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'social.jrofficial.org');
    const origin = `https://${host}`;
    const username = String(req.query.u ?? '').toLowerCase();

    const doc = USERNAME_RE.test(username) ? await (await profiles()).findOne({ username }) : null;
    const live = doc && !doc.disabled ? doc : null;

    const title = live ? `${live.displayName} (@${live.username})` : 'social';
    const desc = live
      ? live.bio || `${live.displayName}'s links, photos and more.`
      : 'One page for all your links, photos and videos.';
    const url = live ? `${origin}/${live.username}` : origin;
    const image = live
      ? `${origin}/api/og?u=${live.username}&v=${live.updatedAt.getTime()}`
      : `${origin}/logo-512.png`;

    const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="social">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(image)}">
</head><body><h1>${esc(title)}</h1><p>${esc(desc)}</p><p><a href="${esc(url)}">${esc(url)}</a></p></body></html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
    return res.status(live ? 200 : 404).send(html);
  } catch (e) {
    console.error(e);
    return res.status(500).send('Server error');
  }
}
