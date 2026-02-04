import { describe, expect, it, beforeEach, vi } from 'vitest';
import worker from '../index';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './cookies';
import { base64UrlEncode } from '../lib/base64url';
import { clearJwksCacheForTests } from './googleIdToken';

class MemoryKV {
  private store = new Map<string, { value: string; expiresAtMs?: number }>();

  async get(key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream'): Promise<any> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAtMs !== undefined && Date.now() > entry.expiresAtMs) {
      this.store.delete(key);
      return null;
    }

    if (!type || type === 'text') return entry.value;
    if (type === 'json') return JSON.parse(entry.value);
    if (type === 'arrayBuffer') return new TextEncoder().encode(entry.value).buffer;
    if (type === 'stream') return new Response(entry.value).body;
    return entry.value;
  }

  async put(key: string, value: string, options?: any): Promise<void> {
    const ttlSeconds = options?.expirationTtl;
    const expiresAtMs = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAtMs });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

}

async function mintTestGoogleIdToken(args: {
  aud: string;
  sub: string;
  iss?: string;
  expSecondsFromNow?: number;
}) {
  const keyPair = (await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  )) as CryptoKeyPair;

  const publicJwk = (await crypto.subtle.exportKey('jwk', keyPair.publicKey)) as JsonWebKey & {
    kid?: string;
    alg?: string;
    use?: string;
  };
  publicJwk.kid = 'test-kid';
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';

  const header = { alg: 'RS256', kid: 'test-kid', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + (args.expSecondsFromNow ?? 60);
  const payload = {
    iss: args.iss ?? 'https://accounts.google.com',
    aud: args.aud,
    sub: args.sub,
    exp,
  };

  const enc = (obj: unknown) => base64UrlEncode(new TextEncoder().encode(JSON.stringify(obj)));

  const signingInput = `${enc(header)}.${enc(payload)}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    keyPair.privateKey,
    new TextEncoder().encode(signingInput),
  );
  const sigB64 = base64UrlEncode(signature);

  return {
    token: `${signingInput}.${sigB64}`,
    jwks: { keys: [publicJwk] },
  };
}

function extractSetCookies(res: Response): string[] {
  const anyHeaders = res.headers as unknown as { getSetCookie?: () => string[] };
  if (typeof anyHeaders.getSetCookie === 'function') return anyHeaders.getSetCookie();

  const single = res.headers.get('set-cookie');
  if (!single) return [];

  // Our worker cookies do not set Expires=, so splitting on commas is safe.
  // Prefer splitting on cookie-name boundary to avoid accidental splits.
  return single
    .split(/,(?=__Host-ve_)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

describe('session/auth flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearJwksCacheForTests();
  });

  it('login sets cookies and /api/me returns userId', async () => {
    const { token, jwks } = await mintTestGoogleIdToken({ aud: 'client-1', sub: 'u_123' });

    const fetchSpy = vi.spyOn(globalThis, 'fetch' as never).mockImplementation(async () => {
      return new Response(JSON.stringify(jwks), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    const env = {
      KV: new MemoryKV(),
      R2: {} as unknown as R2Bucket,
      APP_ORIGINS: 'http://localhost:5173',
      GOOGLE_CLIENT_IDS: 'client-1',
      SESSION_HMAC_SECRET: 'test-secret',
      GOOGLE_JWKS_URL: 'https://jwks.example.test',
      ACCESS_TTL_SECONDS: '3600',
      REFRESH_TTL_SECONDS: '86400',
    };

    const gCsrf = 'csrf-1';

    const loginRes = await worker.fetch(
      new Request('http://worker.test/api/session', {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:5173',
          'Content-Type': 'application/json',
          Cookie: `g_csrf_token=${gCsrf}`,
        },
        body: JSON.stringify({ credential: token, g_csrf_token: gCsrf }),
      }),
      env as never,
    );

    expect(loginRes.status).toBe(204);
    expect(fetchSpy).toHaveBeenCalled();

    const setCookies = extractSetCookies(loginRes);
    expect(setCookies.length).toBeGreaterThanOrEqual(2);

    const access = setCookies.find((c) => c.startsWith(`${ACCESS_COOKIE}=`));
    const refresh = setCookies.find((c) => c.startsWith(`${REFRESH_COOKIE}=`));
    expect(access).toBeTruthy();
    expect(refresh).toBeTruthy();

    const cookieHeader = [access!, refresh!]
      .map((c) => c.split(';')[0])
      .join('; ');

    const meRes = await worker.fetch(
      new Request('http://worker.test/api/me', {
        method: 'GET',
        headers: { Cookie: cookieHeader },
      }),
      env as never,
    );

    expect(meRes.status).toBe(200);
    const json = await meRes.json();
    expect(json).toEqual({ userId: 'u_123' });
  });

  it('refresh rotates refresh token and invalidates the old one', async () => {
    const { token, jwks } = await mintTestGoogleIdToken({ aud: 'client-1', sub: 'u_456' });

    vi.spyOn(globalThis, 'fetch' as never).mockImplementation(async () => {
      return new Response(JSON.stringify(jwks), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    const env = {
      KV: new MemoryKV(),
      R2: {} as unknown as R2Bucket,
      APP_ORIGINS: 'http://localhost:5173',
      GOOGLE_CLIENT_IDS: 'client-1',
      SESSION_HMAC_SECRET: 'test-secret',
      GOOGLE_JWKS_URL: 'https://jwks.example.test',
      ACCESS_TTL_SECONDS: '3600',
      REFRESH_TTL_SECONDS: '86400',
    };

    const gCsrf = 'csrf-2';

    const loginRes = await worker.fetch(
      new Request('http://worker.test/api/session', {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:5173',
          'Content-Type': 'application/json',
          Cookie: `g_csrf_token=${gCsrf}`,
        },
        body: JSON.stringify({ credential: token, g_csrf_token: gCsrf }),
      }),
      env as never,
    );

    expect(loginRes.status).toBe(204);

    const setCookies1 = extractSetCookies(loginRes);
    const refresh1 = setCookies1.find((c) => c.startsWith(`${REFRESH_COOKIE}=`))!;

    const refreshRes = await worker.fetch(
      new Request('http://worker.test/api/session/refresh', {
        method: 'POST',
        headers: { Origin: 'http://localhost:5173', Cookie: refresh1.split(';')[0] },
      }),
      env as never,
    );

    expect(refreshRes.status).toBe(204);
    const setCookies2 = extractSetCookies(refreshRes);
    const refresh2 = setCookies2.find((c) => c.startsWith(`${REFRESH_COOKIE}=`))!;
    expect(refresh2).not.toEqual(refresh1);

    const oldRefreshTry = await worker.fetch(
      new Request('http://worker.test/api/session/refresh', {
        method: 'POST',
        headers: { Origin: 'http://localhost:5173', Cookie: refresh1.split(';')[0] },
      }),
      env as never,
    );

    expect(oldRefreshTry.status).toBe(401);
  });

  it('rejects bad Origin for state-changing endpoints', async () => {
    const env = {
      KV: new MemoryKV(),
      R2: {} as unknown as R2Bucket,
      APP_ORIGINS: 'http://localhost:5173',
      GOOGLE_CLIENT_IDS: 'client-1',
      SESSION_HMAC_SECRET: 'test-secret',
    };

    const res = await worker.fetch(
      new Request('http://worker.test/api/session/refresh', {
        method: 'POST',
        headers: { Origin: 'http://evil.test' },
      }),
      env as never,
    );

    expect(res.status).toBe(403);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('forbidden');
  });

  it('requires matching g_csrf_token cookie + body token on login', async () => {
    const { token, jwks } = await mintTestGoogleIdToken({ aud: 'client-1', sub: 'u_789' });

    vi.spyOn(globalThis, 'fetch' as never).mockImplementation(async () => {
      return new Response(JSON.stringify(jwks), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    const env = {
      KV: new MemoryKV(),
      R2: {} as unknown as R2Bucket,
      APP_ORIGINS: 'http://localhost:5173',
      GOOGLE_CLIENT_IDS: 'client-1',
      SESSION_HMAC_SECRET: 'test-secret',
      GOOGLE_JWKS_URL: 'https://jwks.example.test',
    };

    const res = await worker.fetch(
      new Request('http://worker.test/api/session', {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:5173',
          'Content-Type': 'application/json',
          Cookie: 'g_csrf_token=csrf-a',
        },
        body: JSON.stringify({ credential: token, g_csrf_token: 'csrf-b' }),
      }),
      env as never,
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('bad_csrf');
  });
});
