/**
 * Hebrew date parsing utilities — ported from Python parser.py.
 *
 * Provides gematria conversion, month alias resolution, and lookup
 * tables for building picker UIs.
 */

// ---------------------------------------------------------------------------
// Letter → numeric value (gematria)
// ---------------------------------------------------------------------------

export const LETTER_VALUES: Record<string, number> = {
  א: 1,
  ב: 2,
  ג: 3,
  ד: 4,
  ה: 5,
  ו: 6,
  ז: 7,
  ח: 8,
  ט: 9,
  י: 10,
  כ: 20,
  ך: 20,
  ל: 30,
  מ: 40,
  ם: 40,
  נ: 50,
  ן: 50,
  ס: 60,
  ע: 70,
  פ: 80,
  ף: 80,
  צ: 90,
  ץ: 90,
  ק: 100,
  ר: 200,
  ש: 300,
  ת: 400,
};

// ---------------------------------------------------------------------------
// Hebrew month name → canonical key
// ---------------------------------------------------------------------------

export const MONTH_ALIASES: Record<string, string> = {
  תשרי: "tishrei",
  חשון: "cheshvan",
  חשוון: "cheshvan",
  מרחשון: "cheshvan",
  מרחשוון: "cheshvan",
  כסלו: "kislev",
  טבת: "teves",
  שבט: "shevat",
  אדר: "adar",
  "אדר א": "adar1",
  "אדר ראשון": "adar1",
  "אדר ב": "adar2",
  "אדר שני": "adar2",
  ניסן: "nissan",
  אייר: "iyar",
  איר: "iyar",
  סיון: "sivan",
  סיוון: "sivan",
  תמוז: "tammuz",
  אב: "av",
  אלול: "elul",
};

// ---------------------------------------------------------------------------
// Ordered month list (for dropdown / picker UI)
// ---------------------------------------------------------------------------

export const HEBREW_MONTHS: { key: string; hebrew: string }[] = [
  { key: "tishrei", hebrew: "תשרי" },
  { key: "cheshvan", hebrew: "חשוון" },
  { key: "kislev", hebrew: "כסלו" },
  { key: "teves", hebrew: "טבת" },
  { key: "shevat", hebrew: "שבט" },
  { key: "adar", hebrew: "אדר" },
  { key: "adar1", hebrew: "אדר א" },
  { key: "adar2", hebrew: "אדר ב" },
  { key: "nissan", hebrew: "ניסן" },
  { key: "iyar", hebrew: "אייר" },
  { key: "sivan", hebrew: "סיון" },
  { key: "tammuz", hebrew: "תמוז" },
  { key: "av", hebrew: "אב" },
  { key: "elul", hebrew: "אלול" },
];

// ---------------------------------------------------------------------------
// Integer ↔ gematria conversion
// ---------------------------------------------------------------------------

/** Ones-place letters (1–9). */
const ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];

/** Tens-place letters (10–30 covers days up to 30). */
const TENS = ["", "י", "כ", "ל"];

/**
 * Convert an integer in the range 1–30 to its Hebrew gematria string.
 *
 * Special cases: 15 → טו, 16 → טז (avoid spelling divine names).
 */
export function intToGematria(n: number): string {
  if (n < 1 || n > 30) {
    throw new RangeError(`intToGematria expects 1–30, got ${n}`);
  }

  if (n === 15) return "טו";
  if (n === 16) return "טז";

  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return TENS[tens] + ONES[ones];
}

// ---------------------------------------------------------------------------
// Day gematria lookup (for dropdown / picker UI)
// ---------------------------------------------------------------------------

export const GEMATRIA_DAYS: { value: number; hebrew: string }[] = Array.from(
  { length: 30 },
  (_, i) => ({
    value: i + 1,
    hebrew: intToGematria(i + 1),
  }),
);
