export interface HebrewDateSpec {
  day: number;
  monthKey: string;
  originalText: string;
}

export interface ScheduledEvent {
  summary: string;
  startDate: Date;
  hebrewDateText: string;
}
