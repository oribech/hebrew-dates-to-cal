from __future__ import annotations

from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class HebrewDateSpec:
    day: int
    month_key: str
    original_text: str


@dataclass(frozen=True)
class EventInput:
    hebrew_date: HebrewDateSpec
    name: str = ""
    title: str = ""

    def render_summary(self) -> str:
        name = self.name.strip()
        title = self.title.strip()
        if title:
            if "{name}" in title:
                return title.format(name=name)
            if not name or name in title:
                return title
            joiner = "" if title.endswith("ל") else " "
            return f"{title}{joiner}{name}"
        if not name:
            raise ValueError(
                f"Missing name for Hebrew date '{self.hebrew_date.original_text}'. "
                "Provide either a name or an explicit title."
            )
        return f"יומהולדת ל{name}"


@dataclass(frozen=True)
class ScheduledEvent:
    summary: str
    start_date: date
    hebrew_date_text: str
