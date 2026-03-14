# hebrew-dates-to-cal

Simple Python CLI for converting Hebrew-date CSV files into importable ICS calendars.

## CSV format

Use a header row with:

- `hebrew_date`
- `name`
- optional `title`

If `title` is empty, the event title defaults to `יומהולדת ל{name}`.

If `title` contains `{name}`, it will be formatted with the row name.

## Example

```csv
hebrew_date,name,title
כט סיון,אמא,
יח כסלו,ננה,אזכרה ל{name}
כו אלול,,יהשיר
```

## CLI

```bash
./.venv/bin/python -m hebrew_dates_to_cal input.csv output.ics --occurrences 120
```
