import { base64UrlDecodeToBytes, base64UrlEncode, base64UrlDecodeToString } from '../lib/base64url';

type AccessPayload = {
  userId: string;
  exp: number; // seconds since epoch
};

type AccessHeader = {
  alg: 'HS256';
  typ: 'JWT';
};

function utf8(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', utf8(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

export async function mintAccessToken(userId: string, secret: string, expiresInSeconds: number): Promise<string> {
  const header: AccessHeader = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload: AccessPayload = { userId, exp };

  const headerB64 = base64UrlEncode(utf8(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(utf8(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, utf8(signingInput));
  const sigB64 = base64UrlEncode(sig);

  return `${signingInput}.${sigB64}`;
}

export type VerifyAccessTokenResult =
  | { ok: true; userId: string; exp: number }
  | { ok: false; reason: 'missing' | 'invalid' | 'expired' };

export async function verifyAccessToken(token: string | undefined, secret: string): Promise<VerifyAccessTokenResult> {
  if (!token) return { ok: false, reason: 'missing' };
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'invalid' };

  const [headerB64, payloadB64, sigB64] = parts;
  if (!headerB64 || !payloadB64 || !sigB64) return { ok: false, reason: 'invalid' };

  let header: AccessHeader;
  let payload: AccessPayload;
  try {
    header = JSON.parse(base64UrlDecodeToString(headerB64)) as AccessHeader;
    payload = JSON.parse(base64UrlDecodeToString(payloadB64)) as AccessPayload;
  } catch {
    return { ok: false, reason: 'invalid' };
  }

  if (header.alg !== 'HS256') return { ok: false, reason: 'invalid' };
  if (!payload.userId || typeof payload.userId !== 'string') return { ok: false, reason: 'invalid' };
  if (!payload.exp || typeof payload.exp !== 'number') return { ok: false, reason: 'invalid' };

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) return { ok: false, reason: 'expired' };

  const signingInput = `${headerB64}.${payloadB64}`;
  const key = await importHmacKey(secret);
  const sigBytes = base64UrlDecodeToBytes(sigB64);
  const ok = await crypto.subtle.verify('HMAC', key, sigBytes, utf8(signingInput));
  if (!ok) return { ok: false, reason: 'invalid' };

  return { ok: true, userId: payload.userId, exp: payload.exp };
}
