import type { Env } from './env';
import { sessionHandlers } from './auth/session';
import { notFound, json } from './lib/http';
import { enforceOrigin, enforceRateLimit } from './security/middleware';
import { getClientIp } from './security/clientKey';

const LOGIN_RATE_LIMIT = {
  capacity: 10,
  refillPerSecond: 0.2, // 1 token per 5s
  retryAfterSeconds: 10,
} as const;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return json(200, { ok: true });
    }

    if (url.pathname.startsWith('/api/')) {
      try {
        const originCheck = enforceOrigin(request, env);
        if (!originCheck.ok) return originCheck.response;

        const ip = getClientIp(request);
        const rateKey = `ip:${ip}:path:${url.pathname}`;
        const rl = enforceRateLimit(rateKey, request, LOGIN_RATE_LIMIT);
        if (!rl.ok) return rl.response;

        if (url.pathname === '/api/session') {
          if (request.method === 'POST') return sessionHandlers.login(request, env);
          if (request.method === 'DELETE') return sessionHandlers.logout(request, env);
          return json(405, { error: 'method_not_allowed' });
        }

        if (url.pathname === '/api/session/refresh') {
          if (request.method === 'POST') return sessionHandlers.refresh(request, env);
          return json(405, { error: 'method_not_allowed' });
        }

        if (url.pathname === '/api/me') {
          if (request.method === 'GET') return sessionHandlers.me(request, env);
          return json(405, { error: 'method_not_allowed' });
        }
      } catch (err) {
        return json(500, { error: 'server_error' });
      }
    }

    return notFound();
  },
};
