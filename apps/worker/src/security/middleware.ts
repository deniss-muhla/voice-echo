import { resolveEnv, type Env } from '../env';
import { forbidden, tooManyRequests } from '../lib/http';
import { takeToken, type RateLimitConfig } from '../lib/rateLimit';
import { isAllowedOrigin, isStateChangingMethod } from './origin';

export type SecurityResult = { ok: true } | { ok: false; response: Response };

export function enforceOrigin(request: Request, env: Env): SecurityResult {
  if (!isStateChangingMethod(request.method)) return { ok: true };

  const { allowedOrigins } = resolveEnv(env);
  const origin = request.headers.get('Origin');
  if (!isAllowedOrigin(origin, allowedOrigins)) return { ok: false, response: forbidden('bad_origin') };

  return { ok: true };
}

export function enforceRateLimit(
  key: string,
  request: Request,
  config: RateLimitConfig,
): SecurityResult {
  if (!isStateChangingMethod(request.method)) return { ok: true };

  const ok = takeToken(key, Date.now(), config);
  if (!ok) return { ok: false, response: tooManyRequests(config.retryAfterSeconds) };

  return { ok: true };
}
