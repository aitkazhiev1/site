import { describe, expect, it } from "vitest";
import { formatDateOnly, formatTime } from "./format";

describe("formatDateOnly", () => {
  // Regression guard: building the Date from components (not parsing the bare
  // "YYYY-MM-DD" as UTC midnight) must keep the calendar day intact regardless
  // of the runner's timezone. A naive `new Date("2026-07-15")` would render as
  // the 14th in any timezone behind UTC.
  it("keeps the same calendar day it was given", () => {
    expect(formatDateOnly("2026-07-15")).toContain("15");
    expect(formatDateOnly("2026-01-01")).toContain("1");
    expect(formatDateOnly("2026-12-31")).toContain("31");
  });

  it("renders the month name in Russian", () => {
    expect(formatDateOnly("2026-07-15")).toContain("июля");
  });
});

describe("formatTime", () => {
  it("formats an ISO instant as HH:MM", () => {
    expect(formatTime("2026-07-15T09:05:00Z")).toMatch(/^\d{2}:\d{2}$/);
  });
});
