export type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
  path?: string;
  maxAge?: number;
};

export function parseCookieHeader(headerValue: string | null): Record<string, string> {
  if (!headerValue) return {};
  const out: Record<string, string> = {};
  for (const part of headerValue.split(';')) {
    const [rawName, ...rawValueParts] = part.trim().split('=');
    if (!rawName) continue;
    const value = rawValueParts.join('=');
    out[rawName] = value;
  }
  return out;
}

export function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  const segments: string[] = [`${name}=${value}`];
  const path = options.path ?? '/';
  segments.push(`Path=${path}`);

  if (options.maxAge !== undefined) segments.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly !== false) segments.push('HttpOnly');
  if (options.secure) segments.push('Secure');
  if (options.sameSite) segments.push(`SameSite=${options.sameSite}`);

  return segments.join('; ');
}
