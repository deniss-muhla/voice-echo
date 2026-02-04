export type Jwks = { keys: Array<Record<string, unknown>> };

export async function fetchJwks(url: string): Promise<Jwks> {
  const res = await fetch(url, { cf: { cacheTtl: 600, cacheEverything: true } as never });
  if (!res.ok) throw new Error(`jwks_fetch_failed:${res.status}`);
  return (await res.json()) as Jwks;
}
