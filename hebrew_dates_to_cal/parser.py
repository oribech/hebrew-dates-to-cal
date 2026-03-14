from __future__ import annotations

import csv
import unicodedata
from pathlib import Path

from .models import EventInput, HebrewDateSpec

LETTER_VALUES = {
    "א": 1,
    "ב": 2,
    "ג": 3,
    "ד": 4,
    "ה": 5,
    "ו": 6,
    "ז": 7,
    "ח": 8,
    "ט": 9,
    "י": 10,
    "כ": 20,
    "ך": 20,
    "ל": 30,
    "מ": 40,
    "ם": 40,
    "נ": 50,
    "ן": 50,
    "ס": 60,
    "ע": 70,
    "פ": 80,
    "ף": 80,
    "צ": 90,
    "ץ": 90,
    "ק": 100,
    "ר": 200,
    "ש": 300,
    "ת": 400,
}

MONTH_ALIASES = {
    "תשרי": "tishrei",
    "חשון": "cheshvan",
    "חשוון": "cheshvan",
    "מרחשון": "cheshvan",
    "מרחשוון": "cheshvan",
    "כסלו": "kislev",
    "טבת": "teves",
    "שבט": "shevat",
    "אדר": "adar",
    "אדר א": "adar1",
    "אדר ראשון": "adar1",
    "אדר ב": "adar2",
    "אדר שני": "adar2",
    "ניסן": "nissan",
    "אייר": "iyar",
    "איר": "iyar",
    "סיון": "sivan",
    "סיוון": "sivan",
    "תמוז": "tammuz",
    "אב": "av",
    "אלול": "elul",
}

NAME_FIELDS = ("name",)
DATE_FIELDS = ("hebrew_date", "date")
TITLE_FIELDS = ("title", "summary", "title_template")


def _clean_hebrew_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKC", text or "")
    normalized = normalized.replace('"', " ").replace("׳", " ").replace("״", " ").replace("'", " ")
    chars: list[str] = []
    for char in normalized:
        if char == " ":
            chars.append(char)
            continue
        if unicodedata.category(char).startswith("M"):
            continue
        if "\u05d0" <= char <= "\u05ea":
            chars.append(char)
    return " ".join("".join(chars).split())


def _hebrew_number_to_int(text: str) -> int:
    value = sum(LETTER_VALUES[char] for char in text)
    if value < 1 or value > 30:
        raise ValueError(f"Unsupported Hebrew day value '{text}' -> {value}.")
    return value


def parse_hebrew_date(text: str) -> HebrewDateSpec:
    cleaned = _clean_hebrew_text(text)
    if not cleaned:
        raise ValueError("Hebrew date cannot be empty.")
    day_text, separator, month_text = cleaned.partition(" ")
    if not separator or not month_text:
        raise ValueError(
            f"Hebrew date '{text}' must look like '<day> <month>', for example 'כט סיון'."
        )
    try:
        day = _hebrew_number_to_int(day_text)
    except KeyError as exc:
        raise ValueError(f"Unsupported Hebrew day token '{day_text}'.") from exc
    month_key = MONTH_ALIASES.get(month_text)
    if month_key is None:
        raise ValueError(f"Unsupported Hebrew month token '{month_text}'.")
    return HebrewDateSpec(day=day, month_key=month_key, original_text=cleaned)


def _pick_field(fieldnames: list[str], aliases: tuple[str, ...]) -> str | None:
    normalized_map = {name.strip().lower(): name for name in fieldnames}
    for alias in aliases:
        if alias in normalized_map:
            return normalized_map[alias]
    return None


def load_events_csv(path: str | Path) -> list[EventInput]:
    csv_path = Path(path)
    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            raise ValueError(f"CSV file '{csv_path}' is missing a header row.")
        date_field = _pick_field(reader.fieldnames, DATE_FIELDS)
        name_field = _pick_field(reader.fieldnames, NAME_FIELDS)
        title_field = _pick_field(reader.fieldnames, TITLE_FIELDS)
        if date_field is None:
            raise ValueError(
                f"CSV file '{csv_path}' must include one of these columns: {', '.join(DATE_FIELDS)}."
            )
        if name_field is None and title_field is None:
            raise ValueError(
                f"CSV file '{csv_path}' must include at least one of these columns: "
                f"{', '.join(NAME_FIELDS + TITLE_FIELDS)}."
            )

        events: list[EventInput] = []
        for row_number, row in enumerate(reader, start=2):
            hebrew_date_text = (row.get(date_field) or "").strip()
            if not hebrew_date_text:
                continue
            name = (row.get(name_field) or "").strip() if name_field else ""
            title = (row.get(title_field) or "").strip() if title_field else ""
            if not name and not title:
                raise ValueError(
                    f"Row {row_number} in '{csv_path}' must provide either a name or an explicit title."
                )
            events.append(
                EventInput(
                    hebrew_date=parse_hebrew_date(hebrew_date_text),
                    name=name,
                    title=title,
                )
            )
    return events
