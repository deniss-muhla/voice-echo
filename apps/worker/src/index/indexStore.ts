import type { Env } from '../env';
import type { IndexV1, RecordSummaryV1 } from './indexTypes';

function indexKeyForUser(userId: string): string {
  return `users/${userId}/index.json`;
}

function isoNow(): string {
  return new Date().toISOString();
}

function utcDay(iso: string): string {
  return iso.slice(0, 10);
}

export function createEmptyIndex(): IndexV1 {
  return {
    schema: 'voice-echo.index.v1',
    rev: 1,
    updatedAt: isoNow(),
    records: [],
  };
}

export function sortRecordsNewestFirst(records: RecordSummaryV1[]): RecordSummaryV1[] {
  return records
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : a.id < b.id ? 1 : -1));
}

export type LoadedIndex = {
  key: string;
  etag: string;
  index: IndexV1;
};

export async function loadOrCreateIndex(env: Env, userId: string): Promise<LoadedIndex> {
  const key = indexKeyForUser(userId);

  const existing = await env.R2.get(key);
  if (!existing) {
    const empty = createEmptyIndex();
    const put = await env.R2.put(key, JSON.stringify(empty), {
      httpMetadata: { contentType: 'application/json; charset=utf-8' },
    });

    const etag = put?.etag;
    return { key, etag: etag ?? '"missing_etag"', index: empty };
  }

  const text = await existing.text();
  const parsed = JSON.parse(text) as IndexV1;
  return { key, etag: existing.etag, index: parsed };
}

export async function saveIndexWithEtag(
  env: Env,
  loaded: LoadedIndex,
  expectedEtag: string,
  nextIndex: IndexV1,
): Promise<string> {
  const body = JSON.stringify(nextIndex);
  const put = await env.R2.put(loaded.key, body, {
    httpMetadata: { contentType: 'application/json; charset=utf-8' },
    onlyIf: { etagMatches: expectedEtag },
  });

  if (!put?.etag) {
    const head = await env.R2.head(loaded.key);
    return head?.etag ?? '"missing_etag"';
  }

  return put.etag;
}

export function touchIndex(index: IndexV1): IndexV1 {
  return {
    ...index,
    rev: (index.rev ?? 0) + 1,
    updatedAt: isoNow(),
  };
}

export function makeNewRecord(args: {
  recordId: string;
  createdAt?: string;
  title?: string;
  description?: string;
  tags?: string[];
  durationMs: number;
  audioKey: string;
  mimeType: string;
  bytes?: number;
}): RecordSummaryV1 {
  const createdAt = args.createdAt ?? isoNow();
  return {
    id: args.recordId,
    parentId: null,
    createdAt,
    updatedAt: isoNow(),
    createdDay: utcDay(createdAt),
    title: args.title ?? '',
    description: args.description,
    tags: args.tags,
    durationMs: args.durationMs,
    status: 'active',
    deletedAt: null,
    audio: {
      key: args.audioKey,
      mime: args.mimeType,
      bytes: args.bytes,
    },
  };
}
