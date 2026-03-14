import {
  GEMATRIA_DAYS,
  intToGematria,
  MONTH_ALIASES,
  HEBREW_MONTHS,
} from "../core/hebrewDate";

// ---------------------------------------------------------------------------
// GEMATRIA_DAYS
// ---------------------------------------------------------------------------

describe("GEMATRIA_DAYS", () => {
  it("has 30 entries", () => {
    expect(GEMATRIA_DAYS).toHaveLength(30);
  });

  it('first entry is {value: 1, hebrew: "א"}', () => {
    expect(GEMATRIA_DAYS[0]).toEqual({ value: 1, hebrew: "א" });
  });

  it('entry 15 is {value: 15, hebrew: "טו"} (not יה)', () => {
    const entry = GEMATRIA_DAYS.find((d) => d.value === 15);
    expect(entry).toEqual({ value: 15, hebrew: "טו" });
    expect(entry!.hebrew).not.toBe("יה");
  });

  it('entry 16 is {value: 16, hebrew: "טז"} (not יו)', () => {
    const entry = GEMATRIA_DAYS.find((d) => d.value === 16);
    expect(entry).toEqual({ value: 16, hebrew: "טז" });
    expect(entry!.hebrew).not.toBe("יו");
  });

  it('last entry is {value: 30, hebrew: "ל"}', () => {
    expect(GEMATRIA_DAYS[29]).toEqual({ value: 30, hebrew: "ל" });
  });
});

// ---------------------------------------------------------------------------
// intToGematria
// ---------------------------------------------------------------------------

describe("intToGematria", () => {
  it('intToGematria(1) === "א"', () => {
    expect(intToGematria(1)).toBe("א");
  });

  it('intToGematria(10) === "י"', () => {
    expect(intToGematria(10)).toBe("י");
  });

  it('intToGematria(15) === "טו"', () => {
    expect(intToGematria(15)).toBe("טו");
  });

  it('intToGematria(16) === "טז"', () => {
    expect(intToGematria(16)).toBe("טז");
  });

  it('intToGematria(29) === "כט"', () => {
    expect(intToGematria(29)).toBe("כט");
  });
});

// ---------------------------------------------------------------------------
// MONTH_ALIASES
// ---------------------------------------------------------------------------

describe("MONTH_ALIASES", () => {
  it('"תשרי" maps to "tishrei"', () => {
    expect(MONTH_ALIASES["תשרי"]).toBe("tishrei");
  });

  it('"חשון" maps to "cheshvan"', () => {
    expect(MONTH_ALIASES["חשון"]).toBe("cheshvan");
  });

  it('"חשוון" maps to "cheshvan"', () => {
    expect(MONTH_ALIASES["חשוון"]).toBe("cheshvan");
  });

  it('"אדר" maps to "adar"', () => {
    expect(MONTH_ALIASES["אדר"]).toBe("adar");
  });

  it('"אדר א" maps to "adar1"', () => {
    expect(MONTH_ALIASES["אדר א"]).toBe("adar1");
  });

  it('"אדר ב" maps to "adar2"', () => {
    expect(MONTH_ALIASES["אדר ב"]).toBe("adar2");
  });
});

// ---------------------------------------------------------------------------
// HEBREW_MONTHS
// ---------------------------------------------------------------------------

describe("HEBREW_MONTHS", () => {
  it("has 14 entries (12 regular + adar1 + adar2)", () => {
    expect(HEBREW_MONTHS).toHaveLength(14);
  });

  it("first entry is tishrei", () => {
    expect(HEBREW_MONTHS[0].key).toBe("tishrei");
  });

  it("contains all expected month keys", () => {
    const keys = HEBREW_MONTHS.map((m) => m.key);
    const expected = [
      "tishrei",
      "cheshvan",
      "kislev",
      "teves",
      "shevat",
      "adar",
      "adar1",
      "adar2",
      "nissan",
      "iyar",
      "sivan",
      "tammuz",
      "av",
      "elul",
    ];
    expect(keys).toEqual(expected);
  });
});
