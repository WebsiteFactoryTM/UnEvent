// refreshLock.ts
type AnyFn<T> = () => Promise<T>;

const g = global as any;
g.__refreshLocks ??= new Map<string, Promise<any>>();
const locks: Map<string, Promise<any>> = g.__refreshLocks;

// key by stable user id; fall back to email if needed
export async function withRefreshLock<T>(
  key: string,
  fn: AnyFn<T>,
): Promise<T> {
  const inFlight = locks.get(key);
  if (inFlight) return inFlight as Promise<T>;
  const p = (async () => {
    try {
      return await fn();
    } finally {
      locks.delete(key);
    }
  })();
  locks.set(key, p);
  return p;
}
