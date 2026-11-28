# JR. Social

Linktree-style pages on **social.jrofficial.org**.

| Route | What |
|---|---|
| `/` | Home: intro, sign up / log in |
| `/signup`, `/login` | Google OAuth |
| `/edit` | Editor (redirects to `/login` when signed out) |
| `/admin` | Moderation (only emails in `ADMIN_EMAILS`) |
| `/<username>` | Public phone page. Share, Report and "Create your own" sit outside the phone |

Features: per-page looks (each page can have its own background, colours, buttons and font), per-link styles, undo/redo in the editor, block-based pages (links as button/card/banner, social icons, headings, text, galleries in 4 layouts, images, YouTube/Instagram/Spotify/TikTok/Vimeo embeds, contact forms, dividers), up to 25 pages per profile, Font Awesome icons, 16 themes, gradients, background images, fonts, shadows, 3 navigation styles, inbox for contact forms (CSV export), link-preview card for Discord/X/iMessage, report button + admin moderation page.

Logo: `public/logo.svg` (+ `logo-512.png`, `favicon.svg`, `apple-touch-icon.png`).

Stack: Vite + React + TypeScript, Vercel serverless functions (`/api`), MongoDB Atlas, Google sign-in. All free tier.

---

## Setup tutorial

### 1. MongoDB Atlas (reuse your free cluster)
1. Atlas -> **Database Access** -> make sure you have a DB user (or add one).
2. Atlas -> **Network Access** -> **Add IP Address** -> `0.0.0.0/0` (Vercel's IPs change, so it must be open).
3. Atlas -> **Connect** -> **Drivers** -> copy the `mongodb+srv://...` string and put your user/password in it.
The app creates the `social_profiles` collection and its indexes by itself.

### 2. Google OAuth client
1. https://console.cloud.google.com -> pick/create a project.
2. **APIs & Services -> OAuth consent screen** -> External -> fill app name + your email -> save (publish it to "In production" so anyone can sign in).
3. **Credentials -> Create credentials -> OAuth client ID -> Web application**.
4. **Authorized JavaScript origins** (no redirect URIs needed):
   - `https://social.jrofficial.org`
   - `http://localhost:3000`  (for `vercel dev`)
   - your `*.vercel.app` URL if you want to test before DNS
5. Copy the **Client ID**.

### 3. Vercel
1. vercel.com -> **Add New -> Project** -> import `Wonders0FFICIAL/social`. Framework preset: **Vite** (auto-detected).
2. **Settings -> Environment Variables** (add to Production + Preview):

| Name | Value |
|---|---|
| `MONGODB_URI` | your Atlas connection string |
| `MONGODB_DB` | `jr` |
| `GOOGLE_CLIENT_ID` | the client ID |
| `VITE_GOOGLE_CLIENT_ID` | the same client ID |
| `SESSION_SECRET` | run `openssl rand -hex 32` and paste the result |
| `ADMIN_EMAILS` | optional. Comma-separated Google emails allowed to open `/admin` |
| `USER_IMAGE_QUOTA_MB` | optional. Image storage per user, default 20 |

3. Deploy (redeploy after adding env vars).

### 4. Domain
1. Vercel -> project -> **Settings -> Domains** -> add `social.jrofficial.org`.
2. Cloudflare DNS -> add a **CNAME**: name `social`, target `cname.vercel-dns.com`, **Proxy status: DNS only** (grey cloud) so Vercel can issue the SSL cert.
3. Wait a minute, then open https://social.jrofficial.org/edit

### 5. Local dev
```
npm install
cp .env.example .env.local   # fill it in
npx vercel dev               # NOT plain `vite`, so /api works
```

---

## Moderation
Visitors tap **Report** on any page. Sign in with a Google account listed in `ADMIN_EMAILS` and open `/admin` to dismiss reports, disable / enable a page, or delete a user and their data. Disabled pages 404 and their owner can't edit.

## Notes
- Images are resized in the browser, uploaded to Mongo (`social_images`) and served from `/api/social/img` with long caching. Each user gets a quota (20 MB default) and unused images are cleaned up when you save. Atlas M0 has 512 MB total, so if the site grows, move images to Cloudflare R2 (free tier, 10 GB).
- Limits are generous and only exist to stop abuse: 25 pages, 400 blocks per page, 300 items per gallery, 1.5 MB of page data.
- Link previews: crawlers (Discord, X, Slack, etc.) are rewritten to `/api/page`, which returns meta tags pointing at `/api/og`, a generated 1200x630 card. Normal visitors get the plain SPA.
- This uses 9 of the 12 serverless functions Vercel Hobby allows.
- Contact forms are rate-limited per IP and have a hidden honeypot field.
- Embeds only work for the whitelisted providers (`api/_lib/embed.ts`, same file in `src/social/embed.ts`, keep them identical).
- Links must be https (or mailto/tel). Usernames: 3-20 chars of a-z 0-9 _; reserved words are blocked in `api/_lib/validate.ts`.
- Sessions are an HttpOnly cookie (30 days), signed with `SESSION_SECRET`.
