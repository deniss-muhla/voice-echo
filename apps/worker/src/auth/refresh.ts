import { base64UrlEncode } from '../lib/base64url';

export type RefreshSession = {
  userId: string;
  createdAt: string;
};

export type RefreshStore = {
  get(token: string): Promise<RefreshSession | null>;
  put(token: string, session: RefreshSession, ttlSeconds: number): Promise<void>;
  del(token: string): Promise<void>;
};

export function kvRefreshStore(kv: KVNamespace): RefreshStore {
  return {
    async get(token) {
      const raw = await kv.get(`refresh:${token}`);
      if (!raw) return null;
      return JSON.parse(raw) as RefreshSession;
    },
    async put(token, session, ttlSeconds) {
      await kv.put(`refresh:${token}`, JSON.stringify(session), { expirationTtl: ttlSeconds });
    },
    async del(token) {
      await kv.delete(`refresh:${token}`);
    },
  };
}

export function mintRefreshToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}
