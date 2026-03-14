from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path

from .ics import build_ics
from .parser import load_events_csv
from .scheduler import build_scheduled_events


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Convert Hebrew-date CSV rows into importable ICS all-day events."
    )
    parser.add_argument("input_csv", help="CSV file with hebrew_date,name and optional title columns.")
    parser.add_argument("output_ics", help="Destination ICS file path.")
    parser.add_argument(
        "--from-date",
        default=date.today().isoformat(),
        help="First Gregorian date to include, in ISO format. Default: today.",
    )
    parser.add_argument(
        "--occurrences",
        type=int,
        default=120,
        help="Number of future yearly occurrences to generate per row. Default: 120.",
    )
    parser.add_argument(
        "--calendar-name",
        default="Hebrew Dates",
        help="Calendar name embedded in the ICS output.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_argument_parser()
    args = parser.parse_args(argv)

    from_date = date.fromisoformat(args.from_date)
    events = load_events_csv(args.input_csv)
    scheduled_events = build_scheduled_events(events, from_date=from_date, count=args.occurrences)
    calendar_text = build_ics(scheduled_events, calendar_name=args.calendar_name)

    output_path = Path(args.output_ics)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(calendar_text, encoding="utf-8", newline="")
    return 0
