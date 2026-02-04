export type IndexV1 = {
  schema: 'voice-echo.index.v1';
  rev: number;
  updatedAt: string;
  records: RecordSummaryV1[];
};

export type RecordStatus = 'active' | 'deleted';

export type AudioPointerV1 = {
  key: string;
  mime: string;
  bytes?: number;
  etag?: string;
};

export type RecordSummaryV1 = {
  id: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  createdDay: string;
  title: string;
  description?: string;
  tags?: string[];
  durationMs: number;
  status: RecordStatus;
  deletedAt: string | null;
  audio: AudioPointerV1;
};

export const MAX_DURATION_MS = 43_200_000;
