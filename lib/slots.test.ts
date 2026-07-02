import { describe, expect, it } from "vitest";
import { isSlotAvailable, rangesOverlap } from "./slots";

describe("rangesOverlap", () => {
  it("detects a partial overlap", () => {
    expect(
      rangesOverlap(
        { start: "2026-07-10T10:00:00Z", end: "2026-07-10T10:45:00Z" },
        { start: "2026-07-10T10:30:00Z", end: "2026-07-10T11:15:00Z" },
      ),
    ).toBe(true);
  });

  it("detects one range fully containing the other", () => {
    expect(
      rangesOverlap(
        { start: "2026-07-10T09:00:00Z", end: "2026-07-10T12:00:00Z" },
        { start: "2026-07-10T10:00:00Z", end: "2026-07-10T10:30:00Z" },
      ),
    ).toBe(true);
  });

  it("treats touching boundaries as non-overlapping (half-open interval)", () => {
    expect(
      rangesOverlap(
        { start: "2026-07-10T10:00:00Z", end: "2026-07-10T10:45:00Z" },
        { start: "2026-07-10T10:45:00Z", end: "2026-07-10T11:30:00Z" },
      ),
    ).toBe(false);
  });

  it("returns false for ranges with a gap between them", () => {
    expect(
      rangesOverlap(
        { start: "2026-07-10T09:00:00Z", end: "2026-07-10T09:30:00Z" },
        { start: "2026-07-10T10:00:00Z", end: "2026-07-10T10:30:00Z" },
      ),
    ).toBe(false);
  });

  it("is symmetric regardless of argument order", () => {
    const a = { start: "2026-07-10T10:00:00Z", end: "2026-07-10T10:45:00Z" };
    const b = { start: "2026-07-10T10:30:00Z", end: "2026-07-10T11:15:00Z" };
    expect(rangesOverlap(a, b)).toBe(rangesOverlap(b, a));
  });
});

describe("isSlotAvailable", () => {
  const now = new Date("2026-07-10T08:00:00Z");

  it("is available when there are no busy ranges", () => {
    const slot = { start: "2026-07-10T10:00:00Z", end: "2026-07-10T10:45:00Z" };
    expect(isSlotAvailable(slot, [], now)).toBe(true);
  });

  it("is unavailable when it overlaps a busy range", () => {
    const slot = { start: "2026-07-10T10:00:00Z", end: "2026-07-10T10:45:00Z" };
    const busy = [{ start: "2026-07-10T10:30:00Z", end: "2026-07-10T11:00:00Z" }];
    expect(isSlotAvailable(slot, busy, now)).toBe(false);
  });

  it("is available when adjacent to (not overlapping) a busy range", () => {
    const slot = { start: "2026-07-10T10:00:00Z", end: "2026-07-10T10:45:00Z" };
    const busy = [{ start: "2026-07-10T10:45:00Z", end: "2026-07-10T11:30:00Z" }];
    expect(isSlotAvailable(slot, busy, now)).toBe(true);
  });

  it("is unavailable when it starts in the past", () => {
    const slot = { start: "2026-07-10T07:00:00Z", end: "2026-07-10T07:45:00Z" };
    expect(isSlotAvailable(slot, [], now)).toBe(false);
  });

  it("checks against every busy range, not just the first", () => {
    const slot = { start: "2026-07-10T14:00:00Z", end: "2026-07-10T14:45:00Z" };
    const busy = [
      { start: "2026-07-10T09:00:00Z", end: "2026-07-10T09:30:00Z" },
      { start: "2026-07-10T14:30:00Z", end: "2026-07-10T15:00:00Z" },
    ];
    expect(isSlotAvailable(slot, busy, now)).toBe(false);
  });
});
