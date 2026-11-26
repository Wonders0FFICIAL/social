# JR. Social

Linktree-style pages on **social.jrofficial.org**.

- `/edit` — sign in with Google, build your page with a live phone preview
- `/<username>` — the public phone page

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
Atlas -> collection `social_profiles` -> set `disabled: true` on a doc. Their page 404s right away.

## Notes
- Links must be https. Usernames: 3-20 chars of a-z 0-9 _; reserved words (`admin`, `edit`, `api`...) are blocked in `api/_lib/validate.ts`.
- Sessions are an HttpOnly cookie (30 days), signed with `SESSION_SECRET`.
