# Changelog

All entries: `[timestamp] user request → change`

---

- **2026-03-14 20:30** Init project → Created CLAUDE.md with project guidelines
- **2026-03-14 20:49** Condense CLAUDE.md, add code style + UX principles → Rewrote CLAUDE.md
- **2026-03-14 20:57** Plan mobile app for Hebrew dates to calendar → Created PLAN.md with requirements + implementation plan
- **2026-03-14 21:00** Build the app with tests and APK → Scaffolded React Native (Expo) app in `app/`, ported core logic to TS, built UI, wrote 24 Jest tests, built APK via Gradle
- **2026-03-14 21:13** Copy APK to output → `output/hebrew-dates.apk`
- **2026-03-14 21:25** Fix RTL alignment + export via ICS file → Replaced expo-calendar with ICS generation + expo-intent-launcher to open in Google Calendar; fixed RTL by removing I18nManager.forceRTL and using explicit row-reverse/textAlign
- **2026-03-14 21:35** Rebuild and install to Galaxy → Rebuilt APK, installed via ADB
