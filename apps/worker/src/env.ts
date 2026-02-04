export type Env = {
  KV: KVNamespace;
  R2: R2Bucket;
  APP_ORIGINS?: string; // comma-separated
  GOOGLE_CLIENT_IDS?: string; // comma-separated
  GOOGLE_JWKS_URL?: string;
  SESSION_HMAC_SECRET?: string;
  ACCESS_TTL_SECONDS?: string;
  REFRESH_TTL_SECONDS?: string;
};

export type ResolvedEnv = {
  allowedOrigins: string[];
  googleClientIds: string[];
  googleJwksUrl: string;
  sessionHmacSecret: string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
};

export function resolveEnv(env: Env): ResolvedEnv {
  const allowedOrigins = (env.APP_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);

  const googleClientIds = (env.GOOGLE_CLIENT_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const googleJwksUrl = env.GOOGLE_JWKS_URL ?? 'https://www.googleapis.com/oauth2/v3/certs';

  const sessionHmacSecret = env.SESSION_HMAC_SECRET ?? '';
  if (!sessionHmacSecret) throw new Error('Missing env.SESSION_HMAC_SECRET');
  if (googleClientIds.length === 0) throw new Error('Missing env.GOOGLE_CLIENT_IDS');
  if (allowedOrigins.length === 0) throw new Error('Missing env.APP_ORIGINS');

  const accessTtlSeconds = Number(env.ACCESS_TTL_SECONDS ?? 60 * 60 * 24 * 14); // 14 days
  const refreshTtlSeconds = Number(env.REFRESH_TTL_SECONDS ?? 60 * 60 * 24 * 365); // 365 days

  return {
    allowedOrigins,
    googleClientIds,
    googleJwksUrl,
    sessionHmacSecret,
    accessTtlSeconds,
    refreshTtlSeconds,
  };
}
