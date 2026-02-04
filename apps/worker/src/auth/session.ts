import { resolveEnv, type Env } from '../env';
import { parseCookieHeader } from '../lib/cookies';
import { json, noContent, unauthorized } from '../lib/http';
import { mintAccessToken, verifyAccessToken } from './access';
import { clearAccessCookie, clearRefreshCookie, accessCookie, refreshCookie, REFRESH_COOKIE, ACCESS_COOKIE } from './cookies';
import { kvRefreshStore, mintRefreshToken } from './refresh';
import { verifyGoogleIdToken } from './googleIdToken';
import { fetchJwks } from './jwksFetch';
import { verifyGoogleCsrfToken } from '../security/csrf';

export type SessionHandlers = {
  login: (request: Request, env: Env) => Promise<Response>;
  refresh: (request: Request, env: Env) => Promise<Response>;
  logout: (request: Request, env: Env) => Promise<Response>;
  me: (request: Request, env: Env) => Promise<Response>;
};

function isSecureRequest(request: Request): boolean {
  const url = new URL(request.url);
  return url.protocol === 'https:';
}

export const sessionHandlers: SessionHandlers = {
  async login(request, env) {
    const resolved = resolveEnv(env);

    const body = (await request.json().catch(() => null)) as null | { credential?: string; g_csrf_token?: string };
    if (!body?.credential) return json(400, { error: 'bad_request' });

    if (!verifyGoogleCsrfToken(request, body.g_csrf_token)) return json(400, { error: 'bad_csrf' });

    const verify = await verifyGoogleIdToken(body.credential, resolved.googleClientIds, resolved.googleJwksUrl, {
      fetchJwks,
    });

    if (!verify.ok) return unauthorized();

    const store = kvRefreshStore(env.KV);
    const refreshToken = mintRefreshToken();
    await store.put(refreshToken, { userId: verify.userId, createdAt: new Date().toISOString() }, resolved.refreshTtlSeconds);

    const access = await mintAccessToken(verify.userId, resolved.sessionHmacSecret, resolved.accessTtlSeconds);

    const sec = { secure: isSecureRequest(request) };
    const headers = new Headers();
    headers.append('Set-Cookie', accessCookie(access, resolved.accessTtlSeconds, sec));
    headers.append('Set-Cookie', refreshCookie(refreshToken, resolved.refreshTtlSeconds, sec));

    return noContent({ headers });
  },

  async refresh(request, env) {
    const resolved = resolveEnv(env);

    const cookies = parseCookieHeader(request.headers.get('Cookie'));
    const token = cookies[REFRESH_COOKIE];
    if (!token) return unauthorized();

    const store = kvRefreshStore(env.KV);
    const session = await store.get(token);
    if (!session) return unauthorized();

    await store.del(token);
    const nextRefresh = mintRefreshToken();
    await store.put(nextRefresh, { userId: session.userId, createdAt: new Date().toISOString() }, resolved.refreshTtlSeconds);

    const access = await mintAccessToken(session.userId, resolved.sessionHmacSecret, resolved.accessTtlSeconds);

    const sec = { secure: isSecureRequest(request) };
    const headers = new Headers();
    headers.append('Set-Cookie', accessCookie(access, resolved.accessTtlSeconds, sec));
    headers.append('Set-Cookie', refreshCookie(nextRefresh, resolved.refreshTtlSeconds, sec));

    return noContent({ headers });
  },

  async logout(request, env) {
    const resolved = resolveEnv(env);

    const cookies = parseCookieHeader(request.headers.get('Cookie'));
    const token = cookies[REFRESH_COOKIE];
    const store = kvRefreshStore(env.KV);
    if (token) await store.del(token);

    const sec = { secure: isSecureRequest(request) };
    const headers = new Headers();
    headers.append('Set-Cookie', clearAccessCookie(sec));
    headers.append('Set-Cookie', clearRefreshCookie(sec));

    return noContent({ headers });
  },

  async me(request, env) {
    const resolved = resolveEnv(env);

    const cookies = parseCookieHeader(request.headers.get('Cookie'));
    const token = cookies[ACCESS_COOKIE];
    const verified = await verifyAccessToken(token, resolved.sessionHmacSecret);
    if (!verified.ok) return unauthorized();

    return json(200, { userId: verified.userId });
  },
};
