const hits = new Map<string, number[]>();

/**
 * Simple in-memory sliding-window limiter. Good enough for a single
 * long-lived Node process; on serverless platforms with multiple
 * concurrent instances each instance tracks its own counts, so treat
 * this as a best-effort guard, not a hard cap. A shared store (Upstash
 * Redis, etc.) would be needed for a strict limit across instances.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return false;
}
