import { generateEvents } from "../core/scheduler";
import type { ScheduledEvent } from "../core/types";

describe("generateEvents", () => {
  const TITLE = "Birthday for Moshe";
  const DAY = 10;
  const MONTH_KEY = "tishrei";
  const YEARS_AHEAD = 5;

  let events: ScheduledEvent[];

  beforeAll(() => {
    events = generateEvents(TITLE, DAY, MONTH_KEY, YEARS_AHEAD);
  });

  it("generates the correct number of events for given yearsAhead", () => {
    expect(events).toHaveLength(YEARS_AHEAD);
  });

  it("all events have the correct summary/title", () => {
    for (const event of events) {
      expect(event.summary).toBe(TITLE);
    }
  });

  it("events are sorted by date (ascending)", () => {
    for (let i = 1; i < events.length; i++) {
      expect(events[i].startDate.getTime()).toBeGreaterThanOrEqual(
        events[i - 1].startDate.getTime(),
      );
    }
  });

  it("first event date is >= today", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(events[0].startDate.getTime()).toBeGreaterThanOrEqual(
      today.getTime(),
    );
  });

  it("handles Adar correctly (events still generated for non-leap years)", () => {
    const adarEvents = generateEvents("Adar birthday", 14, "adar", 10);
    expect(adarEvents.length).toBe(10);
    for (const event of adarEvents) {
      expect(event.summary).toBe("Adar birthday");
      expect(event.startDate).toBeInstanceOf(Date);
      expect(event.hebrewDateText).toBeTruthy();
    }
  });
});
