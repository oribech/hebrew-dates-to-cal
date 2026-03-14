from __future__ import annotations

from datetime import datetime, timedelta, timezone
import uuid

from .models import ScheduledEvent


def _escape_text(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace(";", r"\;")
        .replace(",", r"\,")
        .replace("\n", r"\n")
    )


def _fold_ical_line(line: str, limit: int = 75) -> str:
    if not line:
        return line
    lines: list[str] = []
    current = ""
    current_bytes = 0
    for char in line:
        char_bytes = len(char.encode("utf-8"))
        if current and current_bytes + char_bytes > limit:
            lines.append(current)
            current = " " + char
            current_bytes = 1 + char_bytes
            continue
        current += char
        current_bytes += char_bytes
    lines.append(current)
    return "\r\n".join(lines)


def build_ics(events: list[ScheduledEvent], *, calendar_name: str = "Hebrew Dates") -> str:
    dtstamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//hebrew-dates-to-cal//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:{_escape_text(calendar_name)}",
    ]
    for event in events:
        uid_seed = f"{event.summary}|{event.hebrew_date_text}|{event.start_date.isoformat()}"
        event_uid = f"{uuid.uuid5(uuid.NAMESPACE_URL, uid_seed)}@hebrew-dates-to-cal"
        end_date = event.start_date + timedelta(days=1)
        lines.extend(
            [
                "BEGIN:VEVENT",
                f"UID:{event_uid}",
                f"DTSTAMP:{dtstamp}",
                f"SUMMARY:{_escape_text(event.summary)}",
                f"DESCRIPTION:{_escape_text(f'Hebrew date: {event.hebrew_date_text}')}",
                f"DTSTART;VALUE=DATE:{event.start_date:%Y%m%d}",
                f"DTEND;VALUE=DATE:{end_date:%Y%m%d}",
                "TRANSP:TRANSPARENT",
                "END:VEVENT",
            ]
        )
    lines.append("END:VCALENDAR")
    return "\r\n".join(_fold_ical_line(line) for line in lines) + "\r\n"
