export function stableKey(value: unknown) {
  return value
    ? JSON.stringify(sortObject(value as Record<string, unknown>))
    : null;
}

function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce(
      (acc, k) => {
        const v = (obj as any)[k];
        acc[k] =
          v && typeof v === "object" && !Array.isArray(v) ? sortObject(v) : v;
        return acc;
      },
      {} as Record<string, unknown>,
    );
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json();
}

/**
 * Converts a React Query key (array) into a Redis-safe string key.
 */
export function redisKey(queryKey: readonly unknown[]) {
  return queryKey.map(String).join(":");
}
