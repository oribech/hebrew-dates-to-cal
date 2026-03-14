# Hebrew Dates to Calendar — App Plan

## Product Requirements

Mobile app (Android first, iOS later) for adding Hebrew-date events to Google Calendar on their Gregorian dates.

- React Native (cross-platform)
- Manual entry: dropdowns for Hebrew day + month, user types event title
- No default titles — user always writes the full title
- User confirms once, app adds all events in batch (no per-event popup)
- Generate N years of events upfront
- Minimal taps to get events into calendar

---

## Implementation

### Project Setup

- React Native (Expo or bare)
- RTL support for Hebrew
- `react-native-calendar-events` for device calendar access

### Core Logic (port from Python → TypeScript)

- `hebrewDate.ts` — gematria values, month aliases, parse to `{day, monthKey}`
- `scheduler.ts` — Hebrew → Gregorian via `hebcal` lib, generate N occurrences
- Shared types: `HebrewDateSpec`, `ScheduledEvent`

### UI — Single Screen

```
┌─────────────────────────┐
│  Event title: [_______] │
│  Hebrew day:  [ א  ▼ ]  │
│  Hebrew month:[ תשרי ▼ ] │
│  Years ahead: [ 10 ▼ ]  │
│                         │
│  [Add to Calendar]      │
└─────────────────────────┘
```

- Day: א–ל (1–30 in gematria)
- Month: all Hebrew months
- Years: 1, 5, 10, 20

### Calendar Flow

1. Generate all Gregorian dates for Hebrew date × N years
2. Show confirmation: list of dates + title
3. On confirm → batch-write to device calendar via calendar provider
4. Syncs to Google Calendar automatically

### Event Management

- List of previously added event groups
- Delete a group (removes all its calendar entries)

### Build

- Android APK/AAB via EAS Build
- iOS when ready (same codebase)
