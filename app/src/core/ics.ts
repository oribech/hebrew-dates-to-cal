/**
 * ICS (iCalendar) file builder — ported from Python ics.py.
 *
 * Generates RFC 5545 compliant ICS content with deterministic UIDs,
 * UTF-8 aware line folding, and all-day events.
 */

import type { ScheduledEvent } from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape special characters per RFC 5545 TEXT encoding. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Fold a single iCalendar content line so that no line exceeds `limit`
 * *bytes* of UTF-8 (RFC 5545 §3.1).  Continuation lines begin with a
 * single space.
 */
function foldIcalLine(line: string, limit: number = 75): string {
  if (!line) return line;

  const parts: string[] = [];
  let current = "";
  let currentBytes = 0;

  for (const char of line) {
    const charBytes = new TextEncoder().encode(char).length;
    if (current && currentBytes + charBytes > limit) {
      parts.push(current);
      current = " " + char;
      currentBytes = 1 + charBytes;
      continue;
    }
    current += char;
    currentBytes += charBytes;
  }

  parts.push(current);
  return parts.join("\r\n");
}

/**
 * Simple deterministic hash that produces a UUID-like string from a seed.
 * Not cryptographically secure — only used for stable event UIDs.
 */
function deterministicUid(seed: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");

  // Format as 8-4-4-4-12 UUID-like string
  const combined = hex1 + hex2 + hex1.split("").reverse().join("").slice(0, 16);
  return [
    combined.slice(0, 8),
    combined.slice(8, 12),
    combined.slice(12, 16),
    combined.slice(16, 20),
    combined.slice(20, 32),
  ].join("-");
}

/** Format a Date as a YYYYMMDD string for iCal VALUE=DATE fields. */
function formatDate(date: Date): string {
  const y = date.getFullYear().toString();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}${m}${d}`;
}

/** Return the current UTC time as a DTSTAMP string (YYYYMMDDTHHMMSSz). */
function dtstampNow(): string {
  const now = new Date();
  const y = now.getUTCFullYear().toString();
  const mo = (now.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = now.getUTCDate().toString().padStart(2, "0");
  const h = now.getUTCHours().toString().padStart(2, "0");
  const mi = now.getUTCMinutes().toString().padStart(2, "0");
  const s = now.getUTCSeconds().toString().padStart(2, "0");
  return `${y}${mo}${d}T${h}${mi}${s}Z`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build an RFC 5545 ICS string from an array of scheduled events.
 *
 * All events are rendered as all-day (VALUE=DATE) and transparent so they
 * don't block time on the user's calendar.
 */
export function buildIcs(
  events: ScheduledEvent[],
  calendarName: string = "Hebrew Dates",
): string {
  const dtstamp = dtstampNow();

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//hebrew-dates-to-cal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
  ];

  for (const event of events) {
    const uidSeed = `${event.summary}|${event.hebrewDateText}|${event.startDate.toISOString()}`;
    const eventUid = `${deterministicUid(uidSeed)}@hebrew-dates-to-cal`;

    const endDate = new Date(event.startDate);
    endDate.setDate(endDate.getDate() + 1);

    lines.push(
      "BEGIN:VEVENT",
      `UID:${eventUid}`,
      `DTSTAMP:${dtstamp}`,
      `SUMMARY:${escapeText(event.summary)}`,
      `DESCRIPTION:${escapeText(`Hebrew date: ${event.hebrewDateText}`)}`,
      `DTSTART;VALUE=DATE:${formatDate(event.startDate)}`,
      `DTEND;VALUE=DATE:${formatDate(endDate)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return lines.map((line) => foldIcalLine(line)).join("\r\n") + "\r\n";
}
