import {
  addDays,
  endOfDay,
  format,
  isSaturday,
  isSunday,
  nextSaturday,
  nextSunday,
  parseISO,
  startOfDay,
} from "date-fns";

import type { DatePreset, DateRange } from "@/lib/types";

export function resolveDateRange(
  preset: DatePreset,
  customFrom?: string,
  customTo?: string,
  now = new Date(),
): DateRange {
  const today = startOfDay(now);

  switch (preset) {
    case "today":
      return { from: today, to: endOfDay(today), preset };
    case "tomorrow": {
      const tomorrow = addDays(today, 1);
      return { from: tomorrow, to: endOfDay(tomorrow), preset };
    }
    case "weekend": {
      if (isSaturday(today)) {
        return { from: today, to: endOfDay(addDays(today, 1)), preset };
      }
      if (isSunday(today)) {
        return { from: today, to: endOfDay(today), preset };
      }
      const saturday = nextSaturday(today);
      return { from: saturday, to: endOfDay(nextSunday(today)), preset };
    }
    case "next7":
      return { from: today, to: endOfDay(addDays(today, 6)), preset };
    case "next30":
      return { from: today, to: endOfDay(addDays(today, 29)), preset };
    case "custom": {
      const from = customFrom ? startOfDay(parseISO(customFrom)) : today;
      const to = customTo ? endOfDay(parseISO(customTo)) : endOfDay(addDays(from, 6));
      return { from, to, preset };
    }
  }
}

export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatLongDate(isoDate: string): string {
  return format(parseISO(isoDate), "EEEE d MMMM");
}

export function formatShortDate(isoDate: string): string {
  return format(parseISO(isoDate), "d MMM");
}

export function formatTime(time: string): string {
  return time;
}

export function combineDateTime(date: string, time: string): Date {
  return parseISO(`${date}T${time}:00`);
}

export function isEveningTime(time: string): boolean {
  const [hours] = time.split(":").map(Number);
  return hours >= 17;
}

export function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
