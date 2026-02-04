export function isStateChangingMethod(method: string): boolean {
  return method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
}

export function isAllowedOrigin(origin: string | null, allowed: string[]): boolean {
  if (!origin) return false;
  return allowed.includes(origin);
}
