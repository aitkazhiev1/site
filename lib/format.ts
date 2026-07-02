// Single home for date/time formatting so locale/timezone handling stays
// consistent across the storefront, booking flow, and admin panel. All inputs
// are absolute instants (ISO strings from Postgres timestamptz) except
// formatDateOnly, which takes a calendar date ("YYYY-MM-DD") and must be built
// from its components to avoid the UTC-parsing day-shift near midnight.

const LOCALE = "ru-RU";

/** Full date + time with long month and year: "15 июля 2026 г. в 14:30". */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Compact date + time with short month, no year: "15 июл. 14:30". */
export function formatDateTimeShort(iso: string): string {
  return new Date(iso).toLocaleString(LOCALE, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Time of day only: "14:30". */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Long date, no time: "15 июля 2026 г.". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formats a calendar date string ("YYYY-MM-DD") as a long local date.
 * Parses the components explicitly so the date is not shifted by a day when
 * the browser's timezone is behind UTC (which `new Date("2026-07-15")` would
 * do by treating the string as UTC midnight).
 */
export function formatDateOnly(ymd: string): string {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
