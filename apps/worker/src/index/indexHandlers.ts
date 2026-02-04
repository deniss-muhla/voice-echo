import type { Env } from '../env';
import { json, noContent } from '../lib/http';
import { requireUser } from '../auth/requireUser';
import { loadOrCreateIndex, makeNewRecord, saveIndexWithEtag, sortRecordsNewestFirst, touchIndex } from './indexStore';
import { MAX_DURATION_MS } from './indexTypes';

function isUnderUserPrefix(userId: string, key: string): boolean {
  const prefix = `users/${userId}/`;
  return key.startsWith(prefix);
}

function recordAudioPrefix(userId: string, recordId: string): string {
  return `users/${userId}/records/${recordId}/`;
}

export async function handleGetIndex(request: Request, env: Env): Promise<Response> {
  const user = await requireUser(request, env);
  if (!user.ok) return user.response;

  const loaded = await loadOrCreateIndex(env, user.userId);

  const inm = request.headers.get('If-None-Match');
  if (inm && inm === loaded.etag) {
    return noContent({
      status: 304,
      headers: {
        ETag: loaded.etag,
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    });
  }

  return json(200, loaded.index as unknown as Record<string, unknown>, {
    headers: {
      ETag: loaded.etag,
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  });
}

export async function handleCommitRecord(request: Request, env: Env): Promise<Response> {
  const user = await requireUser(request, env);
  if (!user.ok) return user.response;

  const ifMatch = request.headers.get('If-Match');
  if (!ifMatch) return json(400, { error: 'missing_if_match' });

  const body = (await request.json().catch(() => null)) as null | {
    recordId?: string;
    title?: string;
    description?: string;
    tags?: string[];
    durationMs?: number;
    mimeType?: string;
    audioKey?: string;
    bytes?: number;
    createdAt?: string;
  };

  if (!body?.recordId || !body.durationMs || !body.mimeType || !body.audioKey) {
    return json(400, { error: 'bad_request' });
  }

  if (body.durationMs > MAX_DURATION_MS) return json(400, { error: 'duration_too_long' });

  if (!isUnderUserPrefix(user.userId, body.audioKey)) return json(400, { error: 'bad_audio_key' });
  if (!body.audioKey.startsWith(recordAudioPrefix(user.userId, body.recordId))) {
    return json(400, { error: 'bad_audio_key' });
  }

  const loaded = await loadOrCreateIndex(env, user.userId);
  if (loaded.etag !== ifMatch) {
    return json(409, { error: 'etag_mismatch', indexEtag: loaded.etag }, { headers: { ETag: loaded.etag } });
  }

  const now = new Date().toISOString();
  const existing = loaded.index.records.find((r) => r.id === body.recordId);
  const nextRecord =
    existing
      ? {
          ...existing,
          updatedAt: now,
          title: body.title ?? existing.title,
          description: body.description ?? existing.description,
          tags: body.tags ?? existing.tags,
          durationMs: body.durationMs,
          audio: {
            ...existing.audio,
            key: body.audioKey,
            mime: body.mimeType,
            bytes: body.bytes ?? existing.audio.bytes,
          },
        }
      : makeNewRecord({
          recordId: body.recordId,
          createdAt: body.createdAt,
          title: body.title,
          description: body.description,
          tags: body.tags,
          durationMs: body.durationMs,
          audioKey: body.audioKey,
          mimeType: body.mimeType,
          bytes: body.bytes,
        });

  const nextIndex = touchIndex({
    ...loaded.index,
    records: sortRecordsNewestFirst([
      nextRecord,
      ...loaded.index.records.filter((r) => r.id !== body.recordId),
    ]),
  });

  try {
    const nextEtag = await saveIndexWithEtag(env, loaded, ifMatch, nextIndex);
    return json(200, { record: nextRecord, indexEtag: nextEtag }, { headers: { ETag: nextEtag } });
  } catch {
    const latest = await loadOrCreateIndex(env, user.userId);
    return json(409, { error: 'etag_mismatch', indexEtag: latest.etag }, { headers: { ETag: latest.etag } });
  }
}

export async function handleSoftDelete(request: Request, env: Env): Promise<Response> {
  const user = await requireUser(request, env);
  if (!user.ok) return user.response;

  const ifMatch = request.headers.get('If-Match');
  if (!ifMatch) return json(400, { error: 'missing_if_match' });

  const body = (await request.json().catch(() => null)) as null | { recordId?: string };
  if (!body?.recordId) return json(400, { error: 'bad_request' });

  const loaded = await loadOrCreateIndex(env, user.userId);
  if (loaded.etag !== ifMatch) {
    return json(409, { error: 'etag_mismatch', indexEtag: loaded.etag }, { headers: { ETag: loaded.etag } });
  }

  const record = loaded.index.records.find((r) => r.id === body.recordId);
  if (!record) return json(404, { error: 'not_found' });

  const now = new Date().toISOString();
  const nextRecord = {
    ...record,
    status: 'deleted' as const,
    deletedAt: record.deletedAt ?? now,
    updatedAt: now,
  };

  const nextIndex = touchIndex({
    ...loaded.index,
    records: sortRecordsNewestFirst([
      nextRecord,
      ...loaded.index.records.filter((r) => r.id !== body.recordId),
    ]),
  });

  try {
    const nextEtag = await saveIndexWithEtag(env, loaded, ifMatch, nextIndex);
    return json(200, { record: nextRecord, indexEtag: nextEtag }, { headers: { ETag: nextEtag } });
  } catch {
    const latest = await loadOrCreateIndex(env, user.userId);
    return json(409, { error: 'etag_mismatch', indexEtag: latest.etag }, { headers: { ETag: latest.etag } });
  }
}

export async function handlePurge(request: Request, env: Env): Promise<Response> {
  const user = await requireUser(request, env);
  if (!user.ok) return user.response;

  const ifMatch = request.headers.get('If-Match');
  if (!ifMatch) return json(400, { error: 'missing_if_match' });

  const body = (await request.json().catch(() => null)) as null | { recordId?: string };
  if (!body?.recordId) return json(400, { error: 'bad_request' });

  const loaded = await loadOrCreateIndex(env, user.userId);
  if (loaded.etag !== ifMatch) {
    return json(409, { error: 'etag_mismatch', indexEtag: loaded.etag }, { headers: { ETag: loaded.etag } });
  }

  const record = loaded.index.records.find((r) => r.id === body.recordId);
  if (!record) {
    return json(200, { indexEtag: loaded.etag }, { headers: { ETag: loaded.etag } });
  }

  if (record.status !== 'deleted') return json(400, { error: 'record_not_deleted' });

  if (!isUnderUserPrefix(user.userId, record.audio.key)) return json(400, { error: 'bad_audio_key' });

  try {
    await env.R2.delete(record.audio.key);
  } catch {
    // idempotent: missing object is fine
  }

  const nextIndex = touchIndex({
    ...loaded.index,
    records: loaded.index.records.filter((r) => r.id !== body.recordId),
  });

  try {
    const nextEtag = await saveIndexWithEtag(env, loaded, ifMatch, nextIndex);
    return json(200, { indexEtag: nextEtag }, { headers: { ETag: nextEtag } });
  } catch {
    const latest = await loadOrCreateIndex(env, user.userId);
    return json(409, { error: 'etag_mismatch', indexEtag: latest.etag }, { headers: { ETag: latest.etag } });
  }
}
