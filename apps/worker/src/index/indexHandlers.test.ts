import { describe, expect, it } from 'vitest';
import worker from '../index';
import { mintAccessToken } from '../auth/access';

class MemoryKV {
  async get(): Promise<string | null> {
    return null;
  }
  async put(): Promise<void> {
    // no-op
  }
  async delete(): Promise<void> {
    // no-op
  }
}

type StoredObject = { body: string; etag: string; contentType?: string };

class MemoryR2 {
  private store = new Map<string, StoredObject>();
  private etagCounter = 0;
  public deletes: string[] = [];

  async get(key: string): Promise<any | null> {
    const obj = this.store.get(key);
    if (!obj) return null;
    return {
      etag: obj.etag,
      async text() {
        return obj.body;
      },
    };
  }

  async head(key: string): Promise<any | null> {
    const obj = this.store.get(key);
    if (!obj) return null;
    return { etag: obj.etag };
  }

  async put(key: string, value: string, options?: any): Promise<{ etag: string }> {
    const onlyIf = options?.onlyIf;
    const match = onlyIf?.etagMatches;

    const existing = this.store.get(key);
    if (match !== undefined) {
      if (!existing || existing.etag !== match) {
        throw new Error('precondition_failed');
      }
    }

    this.etagCounter++;
    const etag = `\"mem-${this.etagCounter}\"`;
    this.store.set(key, {
      body: value,
      etag,
      contentType: options?.httpMetadata?.contentType,
    });

    return { etag };
  }

  async delete(key: string): Promise<void> {
    this.deletes.push(key);
    this.store.delete(key);
  }
}

async function authedEnvAndCookie(userId: string) {
  const r2 = new MemoryR2();
  const secret = 'test-secret';
  const access = await mintAccessToken(userId, secret, 3600);
  const cookie = `__Host-ve_access=${access}`;

  const env = {
    KV: new MemoryKV() as unknown as KVNamespace,
    R2: r2 as unknown as R2Bucket,
    APP_ORIGINS: 'http://localhost:5173',
    GOOGLE_CLIENT_IDS: 'client-1',
    SESSION_HMAC_SECRET: secret,
  };

  return { env, cookie, r2 };
}

describe('index API (P1-2)', () => {
  it('GET /api/index returns 200 + ETag and supports 304', async () => {
    const { env, cookie } = await authedEnvAndCookie('u_1');

    const first = await worker.fetch(
      new Request('http://worker.test/api/index', {
        method: 'GET',
        headers: { Cookie: cookie },
      }),
      env as never,
    );

    expect(first.status).toBe(200);
    const etag1 = first.headers.get('ETag');
    expect(etag1).toBeTruthy();
    const body1 = (await first.json()) as any;
    expect(body1.schema).toBe('voice-echo.index.v1');
    expect(Array.isArray(body1.records)).toBe(true);

    const second = await worker.fetch(
      new Request('http://worker.test/api/index', {
        method: 'GET',
        headers: { Cookie: cookie, 'If-None-Match': etag1! },
      }),
      env as never,
    );

    expect(second.status).toBe(304);
  });

  it('commit -> soft-delete -> purge updates index with optimistic concurrency', async () => {
    const { env, cookie, r2 } = await authedEnvAndCookie('u_2');

    const indexRes = await worker.fetch(
      new Request('http://worker.test/api/index', { method: 'GET', headers: { Cookie: cookie } }),
      env as never,
    );
    const etag1 = indexRes.headers.get('ETag')!;

    const recordId = '01TESTREC';
    const audioKey = `users/u_2/records/${recordId}/audio.webm`;

    const commitRes = await worker.fetch(
      new Request('http://worker.test/api/records/commit', {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:5173',
          Cookie: cookie,
          'Content-Type': 'application/json',
          'If-Match': etag1,
        },
        body: JSON.stringify({
          recordId,
          durationMs: 1234,
          mimeType: 'audio/webm',
          audioKey,
          bytes: 42,
          title: 'Hello',
        }),
      }),
      env as never,
    );

    expect(commitRes.status).toBe(200);
    const etag2 = commitRes.headers.get('ETag')!;
    expect(etag2).not.toEqual(etag1);

    const staleCommit = await worker.fetch(
      new Request('http://worker.test/api/records/commit', {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:5173',
          Cookie: cookie,
          'Content-Type': 'application/json',
          'If-Match': etag1,
        },
        body: JSON.stringify({ recordId, durationMs: 1234, mimeType: 'audio/webm', audioKey }),
      }),
      env as never,
    );
    expect(staleCommit.status).toBe(409);

    const softDeleteRes = await worker.fetch(
      new Request('http://worker.test/api/records/soft-delete', {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:5173',
          Cookie: cookie,
          'Content-Type': 'application/json',
          'If-Match': etag2,
        },
        body: JSON.stringify({ recordId }),
      }),
      env as never,
    );

    expect(softDeleteRes.status).toBe(200);
    const etag3 = softDeleteRes.headers.get('ETag')!;

    const purgeRes = await worker.fetch(
      new Request('http://worker.test/api/records/purge', {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:5173',
          Cookie: cookie,
          'Content-Type': 'application/json',
          'If-Match': etag3,
        },
        body: JSON.stringify({ recordId }),
      }),
      env as never,
    );

    expect(purgeRes.status).toBe(200);
    expect(r2.deletes).toContain(audioKey);

    const indexAfter = await worker.fetch(
      new Request('http://worker.test/api/index', { method: 'GET', headers: { Cookie: cookie } }),
      env as never,
    );
    const bodyAfter = (await indexAfter.json()) as any;
    expect(bodyAfter.records.find((r: any) => r.id === recordId)).toBeUndefined();
  });

  it('commit rejects durationMs > 12h', async () => {
    const { env, cookie } = await authedEnvAndCookie('u_3');

    const indexRes = await worker.fetch(
      new Request('http://worker.test/api/index', { method: 'GET', headers: { Cookie: cookie } }),
      env as never,
    );
    const etag = indexRes.headers.get('ETag')!;

    const recordId = '01LONG';
    const res = await worker.fetch(
      new Request('http://worker.test/api/records/commit', {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:5173',
          Cookie: cookie,
          'Content-Type': 'application/json',
          'If-Match': etag,
        },
        body: JSON.stringify({
          recordId,
          durationMs: 43_200_000 + 1,
          mimeType: 'audio/webm',
          audioKey: `users/u_3/records/${recordId}/audio.webm`,
        }),
      }),
      env as never,
    );

    expect(res.status).toBe(400);
  });
});
