import { parseCookieHeader } from '../lib/cookies';

export function verifyGoogleCsrfToken(request: Request, bodyToken: string | undefined): boolean {
  if (!bodyToken) return false;
  const cookies = parseCookieHeader(request.headers.get('Cookie'));
  const cookieToken = cookies['g_csrf_token'];
  if (!cookieToken) return false;
  return cookieToken === bodyToken;
}
