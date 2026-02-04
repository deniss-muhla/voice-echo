export type JsonObject = Record<string, unknown>;

export function json(status: number, body: JsonObject, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(body), { ...init, status, headers });
}

export function noContent(init: ResponseInit = {}): Response {
  return new Response(null, { ...init, status: init.status ?? 204 });
}

export function methodNotAllowed(): Response {
  return json(405, { error: 'method_not_allowed' });
}

export function notFound(): Response {
  return json(404, { error: 'not_found' });
}

export function unauthorized(): Response {
  return json(401, { error: 'unauthorized' });
}

export function forbidden(reason?: string): Response {
  return json(403, { error: 'forbidden', reason });
}

export function tooManyRequests(retryAfterSeconds: number): Response {
  return json(
    429,
    { error: 'rate_limited', retryAfterSeconds },
    { headers: { 'Retry-After': String(retryAfterSeconds) } },
  );
}

export async function readJson<T>(request: Request): Promise<T> {
  const text = await request.text();
  if (!text) throw new Error('empty_json');
  return JSON.parse(text) as T;
}
