import { serializeCookie } from '../lib/cookies';

export const ACCESS_COOKIE = '__Host-ve_access';
export const REFRESH_COOKIE = '__Host-ve_refresh';

export type CookieSecurity = {
  secure: boolean;
};

export function accessCookie(value: string, maxAgeSeconds: number, sec: CookieSecurity): string {
  return serializeCookie(ACCESS_COOKIE, value, {
    path: '/',
    httpOnly: true,
    secure: sec.secure,
    sameSite: 'Lax',
    maxAge: maxAgeSeconds,
  });
}

export function refreshCookie(value: string, maxAgeSeconds: number, sec: CookieSecurity): string {
  return serializeCookie(REFRESH_COOKIE, value, {
    path: '/',
    httpOnly: true,
    secure: sec.secure,
    sameSite: 'Lax',
    maxAge: maxAgeSeconds,
  });
}

export function clearAccessCookie(sec: CookieSecurity): string {
  return serializeCookie(ACCESS_COOKIE, '', {
    path: '/',
    httpOnly: true,
    secure: sec.secure,
    sameSite: 'Lax',
    maxAge: 0,
  });
}

export function clearRefreshCookie(sec: CookieSecurity): string {
  return serializeCookie(REFRESH_COOKIE, '', {
    path: '/',
    httpOnly: true,
    secure: sec.secure,
    sameSite: 'Lax',
    maxAge: 0,
  });
}
