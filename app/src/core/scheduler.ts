/**
 * Hebrew-to-Gregorian date scheduling — ported from Python scheduler.py.
 *
 * Uses @hebcal/core's HDate for Hebrew ↔ Gregorian conversion.
 */

import { HDate } from "@hebcal/core";
import type { ScheduledEvent } from "./types";

// ---------------------------------------------------------------------------
// Month-key → @hebcal/core month name mapping
// ---------------------------------------------------------------------------

const MONTH_KEY_TO_HEBCAL: Record<string, string> = {
  tishrei: "Tishrei",
  cheshvan: "Cheshvan",
  kislev: "Kislev",
  teves: "Tevet",
  shevat: "Sh'vat",
  adar: "Adar",
  adar1: "Adar I",
  adar2: "Adar II",
  nissan: "Nisan",
  iyar: "Iyyar",
  sivan: "Sivan",
  tammuz: "Tamuz",
  av: "Av",
  elul: "Elul",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve the hebcal month name for a given monthKey and Hebrew year,
 * applying the standard Adar / leap-year rules:
 *
 * - "adar" in a leap year  → Adar II  (the "main" Adar for birthdays etc.)
 * - "adar2" in a non-leap year → Adar  (fall back to the only Adar)
 */
function hebcalMonthName(monthKey: string, hebrewYear: number): string {
  const base = MONTH_KEY_TO_HEBCAL[monthKey];
  if (base === undefined) {
    throw new Error(`Unsupported month key '${monthKey}'.`);
  }

  const leap = HDate.isLeapYear(hebrewYear);

  if (monthKey === "adar" && leap) {
    return "Adar II";
  }
  if (monthKey === "adar2" && !leap) {
    return "Adar";
  }

  return base;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate the next `count` Gregorian occurrences of a recurring Hebrew date,
 * starting no earlier than `fromDate`.
 *
 * Returns events with an empty `summary` — the caller is responsible for
 * filling it in (mirrors the Python pipeline pattern).
 */
export function generateOccurrences(
  day: number,
  monthKey: string,
  fromDate: Date,
  count: number,
): ScheduledEvent[] {
  if (count < 1) {
    throw new RangeError("Occurrence count must be at least 1.");
  }

  const startHDate = new HDate(fromDate);
  let hebrewYear = startHDate.getFullYear();

  const occurrences: ScheduledEvent[] = [];

  while (occurrences.length < count) {
    const month = hebcalMonthName(monthKey, hebrewYear);
    const hd = new HDate(day, month, hebrewYear);
    const greg = hd.greg();

    if (greg >= fromDate) {
      occurrences.push({
        summary: "",
        startDate: greg,
        hebrewDateText: `${day} ${month} ${hebrewYear}`,
      });
    }

    hebrewYear += 1;
  }

  return occurrences;
}

/**
 * Convenience wrapper: generate `yearsAhead` future occurrences of a Hebrew
 * date and stamp each event with the given title.
 */
export function generateEvents(
  title: string,
  day: number,
  monthKey: string,
  yearsAhead: number,
): ScheduledEvent[] {
  const events = generateOccurrences(day, monthKey, new Date(), yearsAhead);

  for (const event of events) {
    event.summary = title;
  }

  return events;
}
