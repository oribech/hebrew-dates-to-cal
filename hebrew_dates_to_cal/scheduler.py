from __future__ import annotations

from datetime import date

from pyluach import dates
from pyluach.hebrewcal import Year

from .models import EventInput, HebrewDateSpec, ScheduledEvent

FIXED_MONTH_NUMBERS = {
    "nissan": 1,
    "iyar": 2,
    "sivan": 3,
    "tammuz": 4,
    "av": 5,
    "elul": 6,
    "tishrei": 7,
    "cheshvan": 8,
    "kislev": 9,
    "teves": 10,
    "shevat": 11,
}


def _month_number_for_year(month_key: str, hebrew_year: int) -> int:
    if month_key in FIXED_MONTH_NUMBERS:
        return FIXED_MONTH_NUMBERS[month_key]
    is_leap = Year(hebrew_year).leap
    if month_key == "adar":
        return 13 if is_leap else 12
    if month_key == "adar1":
        return 12
    if month_key == "adar2":
        return 13 if is_leap else 12
    raise ValueError(f"Unsupported month key '{month_key}'.")


def _gregorian_for_hebrew_year(spec: HebrewDateSpec, hebrew_year: int) -> date:
    month_number = _month_number_for_year(spec.month_key, hebrew_year)
    try:
        gregorian = dates.HebrewDate(hebrew_year, month_number, spec.day).to_greg()
    except ValueError as exc:
        raise ValueError(
            f"Hebrew date '{spec.original_text}' does not exist in Hebrew year {hebrew_year}."
        ) from exc
    return date(gregorian.year, gregorian.month, gregorian.day)


def generate_occurrences(spec: HebrewDateSpec, from_date: date, count: int) -> list[date]:
    if count < 1:
        raise ValueError("Occurrence count must be at least 1.")
    current_hebrew = dates.GregorianDate(from_date.year, from_date.month, from_date.day).to_heb()
    occurrences: list[date] = []
    hebrew_year = current_hebrew.year
    while len(occurrences) < count:
        candidate = _gregorian_for_hebrew_year(spec, hebrew_year)
        if candidate >= from_date:
            occurrences.append(candidate)
        hebrew_year += 1
    return occurrences


def build_scheduled_events(
    events: list[EventInput],
    *,
    from_date: date,
    count: int,
) -> list[ScheduledEvent]:
    scheduled: list[ScheduledEvent] = []
    for event in events:
        summary = event.render_summary()
        for occurrence in generate_occurrences(event.hebrew_date, from_date=from_date, count=count):
            scheduled.append(
                ScheduledEvent(
                    summary=summary,
                    start_date=occurrence,
                    hebrew_date_text=event.hebrew_date.original_text,
                )
            )
    scheduled.sort(key=lambda item: (item.start_date, item.summary))
    return scheduled
