export interface TimeRange {
  start: Date | string;
  end: Date | string;
}

/**
 * Half-open interval overlap check, mirroring the DB's tstzrange semantics
 * (`&&` on `[start, end)`): touching endpoints do not count as overlapping.
 */
export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  const aStart = new Date(a.start).getTime();
  const aEnd = new Date(a.end).getTime();
  const bStart = new Date(b.start).getTime();
  const bEnd = new Date(b.end).getTime();

  return aStart < bEnd && bStart < aEnd;
}

/**
 * A candidate slot is available only if it doesn't overlap any busy range
 * (existing appointments, time off) and doesn't start in the past.
 */
export function isSlotAvailable(
  slot: TimeRange,
  busyRanges: TimeRange[],
  now: Date = new Date(),
): boolean {
  if (new Date(slot.start).getTime() <= now.getTime()) return false;
  return !busyRanges.some((busy) => rangesOverlap(slot, busy));
}
