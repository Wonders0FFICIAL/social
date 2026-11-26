import { SignJWT, jwtVerify } from 'jose';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const COOKIE = 'jr_social';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface Session {
  sub: string;
  name?: string;
  picture?: string;
}

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set (32+ characters)');
  }
  return new TextEncoder().encode(secret);
}

function cookieFlags(req: VercelRequest) {
  const local = (req.headers.host || '').startsWith('localhost');
  return `HttpOnly; SameSite=Lax; Path=/${local ? '' : '; Secure'}`;
}

export async function createSession(
  req: VercelRequest,
  res: VercelResponse,
  s: Session,
) {
  const token = await new SignJWT({ name: s.name, picture: s.picture })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(s.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token}; Max-Age=${MAX_AGE}; ${cookieFlags(req)}`,
  );
}

export function clearSession(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Max-Age=0; ${cookieFlags(req)}`);
}

export async function getSession(req: VercelRequest): Promise<Session | null> {
  const header = req.headers.cookie;
  if (!header) return null;
  const match = header
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`));
  if (!match) return null;
  try {
    const { payload } = await jwtVerify(match.slice(COOKIE.length + 1), key());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      name: typeof payload.name === 'string' ? payload.name : undefined,
      picture: typeof payload.picture === 'string' ? payload.picture : undefined,
    };
  } catch {
    return null;
  }
}
