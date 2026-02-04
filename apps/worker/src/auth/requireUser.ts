import type { Env } from '../env';
import { resolveEnv } from '../env';
import { parseCookieHeader } from '../lib/cookies';
import { unauthorized } from '../lib/http';
import { ACCESS_COOKIE } from './cookies';
import { verifyAccessToken } from './access';

export type RequireUserResult = { ok: true; userId: string } | { ok: false; response: Response };

export async function requireUser(request: Request, env: Env): Promise<RequireUserResult> {
  const resolved = resolveEnv(env);
  const cookies = parseCookieHeader(request.headers.get('Cookie'));
  const token = cookies[ACCESS_COOKIE];

  const verified = await verifyAccessToken(token, resolved.sessionHmacSecret);
  if (!verified.ok) return { ok: false, response: unauthorized() };

  return { ok: true, userId: verified.userId };
}
