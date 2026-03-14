from __future__ import annotations

import csv
import subprocess
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

from hebrew_dates_to_cal.parser import parse_hebrew_date
from hebrew_dates_to_cal.scheduler import generate_occurrences


class ParseHebrewDateTests(unittest.TestCase):
    def test_parse_hebrew_date_strips_noise(self) -> None:
        parsed = parse_hebrew_date("כ כסלו🎉")

        self.assertEqual(parsed.day, 20)
        self.assertEqual(parsed.month_key, "kislev")


class GenerateOccurrencesTests(unittest.TestCase):
    def test_generate_occurrences_skips_past_hebrew_year_and_keeps_future_dates(self) -> None:
        parsed = parse_hebrew_date("יח כסלו")

        actual = generate_occurrences(parsed, from_date=date(2026, 3, 14), count=3)

        self.assertEqual(
            actual,
            [
                date(2026, 11, 28),
                date(2027, 12, 18),
                date(2028, 12, 6),
            ],
        )


class CliRegressionTests(unittest.TestCase):
    def test_cli_writes_google_calendar_friendly_ics(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            csv_path = tmp_path / "events.csv"
            ics_path = tmp_path / "events.ics"

            with csv_path.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=["hebrew_date", "name", "title"])
                writer.writeheader()
                writer.writerow({"hebrew_date": "כט סיון", "name": "אמא", "title": ""})
                writer.writerow({"hebrew_date": "יח כסלו", "name": "ננה", "title": "אזכרה ל{name}"})
                writer.writerow({"hebrew_date": "כו אלול", "name": "יהשיר", "title": "אזכרה ל{name}"})

            subprocess.run(
                [
                    sys.executable,
                    "-m",
                    "hebrew_dates_to_cal",
                    str(csv_path),
                    str(ics_path),
                    "--from-date",
                    "2026-03-14",
                    "--occurrences",
                    "2",
                ],
                check=True,
            )

            calendar_text = ics_path.read_text(encoding="utf-8")

            self.assertIn("BEGIN:VCALENDAR", calendar_text)
            self.assertIn("SUMMARY:יומהולדת לאמא", calendar_text)
            self.assertIn("SUMMARY:אזכרה לננה", calendar_text)
            self.assertIn("SUMMARY:אזכרה ליהשיר", calendar_text)
            self.assertIn("DTSTART;VALUE=DATE:20260614", calendar_text)
            self.assertIn("DTSTART;VALUE=DATE:20270704", calendar_text)
            self.assertIn("DTSTART;VALUE=DATE:20261128", calendar_text)
            self.assertIn("DTSTART;VALUE=DATE:20270928", calendar_text)
            self.assertEqual(calendar_text.count("BEGIN:VEVENT"), 6)


if __name__ == "__main__":
    unittest.main()
