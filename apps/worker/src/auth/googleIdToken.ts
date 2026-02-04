import { base64UrlDecodeToBytes, base64UrlDecodeToString } from '../lib/base64url';

export type GoogleIdTokenClaims = {
  iss: string;
  aud: string;
  sub: string;
  exp: number;
};

type JwtHeader = {
  alg: string;
  kid?: string;
  typ?: string;
};

type Jwks = {
  keys: Array<Record<string, unknown>>;
};

function utf8(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

async function importRs256PublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
}

function isAllowedIssuer(iss: string): boolean {
  return iss === 'https://accounts.google.com' || iss === 'accounts.google.com';
}

export type VerifyGoogleIdTokenDeps = {
  fetchJwks: (url: string) => Promise<Jwks>;
  nowSeconds?: () => number;
};

let cachedJwks: { url: string; fetchedAtMs: number; jwks: Jwks } | null = null;

async function getJwks(url: string, deps: VerifyGoogleIdTokenDeps): Promise<Jwks> {
  const nowMs = Date.now();
  if (cachedJwks && cachedJwks.url === url && nowMs - cachedJwks.fetchedAtMs < 10 * 60 * 1000) {
    return cachedJwks.jwks;
  }
  const jwks = await deps.fetchJwks(url);
  cachedJwks = { url, fetchedAtMs: nowMs, jwks };
  return jwks;
}

export type VerifyGoogleIdTokenResult =
  | { ok: true; userId: string; claims: GoogleIdTokenClaims }
  | { ok: false; reason: 'invalid' | 'expired' | 'bad_audience' };

export async function verifyGoogleIdToken(
  idToken: string,
  googleClientIds: string[],
  jwksUrl: string,
  deps: VerifyGoogleIdTokenDeps,
): Promise<VerifyGoogleIdTokenResult> {
  const parts = idToken.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'invalid' };
  const [h, p, s] = parts;
  if (!h || !p || !s) return { ok: false, reason: 'invalid' };

  let header: JwtHeader;
  let claims: GoogleIdTokenClaims;
  try {
    header = JSON.parse(base64UrlDecodeToString(h)) as JwtHeader;
    claims = JSON.parse(base64UrlDecodeToString(p)) as GoogleIdTokenClaims;
  } catch {
    return { ok: false, reason: 'invalid' };
  }

  if (header.alg !== 'RS256') return { ok: false, reason: 'invalid' };
  if (!claims.sub || !claims.exp || !claims.iss || !claims.aud) return { ok: false, reason: 'invalid' };
  if (!isAllowedIssuer(claims.iss)) return { ok: false, reason: 'invalid' };

  if (!googleClientIds.includes(claims.aud)) return { ok: false, reason: 'bad_audience' };

  const now = deps.nowSeconds?.() ?? Math.floor(Date.now() / 1000);
  if (claims.exp <= now) return { ok: false, reason: 'expired' };

  const jwks = await getJwks(jwksUrl, deps);
  const kid = header.kid;
  const keyRecord = jwks.keys.find((k) => (kid ? k.kid === kid : true));
  if (!keyRecord) return { ok: false, reason: 'invalid' };

  const jwk = keyRecord as unknown as JsonWebKey;
  const key = await importRs256PublicKey(jwk);

  const signingInput = utf8(`${h}.${p}`);
  const signature = base64UrlDecodeToBytes(s);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, signingInput);
  if (!ok) return { ok: false, reason: 'invalid' };

  return { ok: true, userId: claims.sub, claims };
}

export function clearJwksCacheForTests(): void {
  cachedJwks = null;
}
