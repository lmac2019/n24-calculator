import {
  addDays,
  differenceInDays,
  format,
  parseISO,
  addMinutes,
  setHours,
  setMinutes,
} from "date-fns";
import {
  zonedTimeToUtc,
  utcToZonedTime,
  format as formatTz,
} from "date-fns-tz";
import { LOCAL_TZ, BEIJING_TZ } from "./constants";

export type ScheduleRow = {
  day: number;
  date: Date;
  sleepStart: string;
  sleepEnd: string;
  wakeStart: string;
  wakeEnd: string;
  sleepStartBJ: string;
  sleepEndBJ: string;
  wakeStartBJ: string;
  wakeEndBJ: string;
};

/**
 * Converts a time string (HH:MM) to a Date object based on a base date
 */
export function timeStringToDate(baseDate: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  return setMinutes(setHours(baseDate, h), m);
}

/**
 * Determines if the end time is on the next day compared to the start time
 */
export function isNextDay(start: Date, end: Date, timeZone?: string): boolean {
  const getHour = (d: Date) => timeZone ? parseInt(formatTz(d, "H", { timeZone }), 10) : d.getHours();
  const getMinute = (d: Date) => timeZone ? parseInt(formatTz(d, "m", { timeZone }), 10) : d.getMinutes();
  const startHour = getHour(start);
  const startMinute = getMinute(start);
  const endHour = getHour(end);
  const endMinute = getMinute(end);
  return (endHour < startHour) || (endHour === startHour && endMinute <= startMinute);
}

/**
 * Formats a time range in Beijing timezone
 */
export function formatBeijingRange(
  localStart: Date,
  localEnd: Date
): [string, string] {
  const startUtc = zonedTimeToUtc(localStart, LOCAL_TZ);
  const endUtc = zonedTimeToUtc(localEnd, LOCAL_TZ);
  const startInBJ = utcToZonedTime(startUtc, BEIJING_TZ);
  const endInBJ = utcToZonedTime(endUtc, BEIJING_TZ);

  const startStr = formatTz(startInBJ, "h:mm a", { timeZone: BEIJING_TZ });
  const endStr = formatTz(endInBJ, "h:mm a", { timeZone: BEIJING_TZ });

  const nextDay = isNextDay(startInBJ, endInBJ, BEIJING_TZ);

  return [startStr, `${endStr}${nextDay ? " (next day)" : ""}`];
}

/**
 * Formats a time range in local timezone
 */
export function formatLocalRange(start: Date, end: Date): [string, string] {
  const startStr = format(start, "h:mm a");
  const endStr = format(end, "h:mm a");
  const nextDay = isNextDay(start, end);
  return [startStr, `${endStr}${nextDay ? " (next day)" : ""}`];
}

/**
 * Generates a note key for a given day and date
 */
export function getNoteKey(day: number, date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Generates a complete sleep schedule based on input parameters
 */
export function generateSchedule(
  currentSleepStart: string,
  currentSleepEnd: string,
  currentDate: string,
  startDate: string,
  endDate: string,
  dailyShiftMinutes: number
): ScheduleRow[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const current = parseISO(currentDate);

  const totalDays = differenceInDays(end, start) + 1;
  const offsetDays = differenceInDays(start, current);

  const rows: ScheduleRow[] = [];

  for (let i = 0; i < totalDays; i++) {
    const dayNum = i + 1;
    const thisDate = addDays(start, i);
    const shift = (offsetDays + i) * dailyShiftMinutes;

    const baseSleepStart = timeStringToDate(thisDate, currentSleepStart);
    const baseSleepEnd = timeStringToDate(thisDate, currentSleepEnd);

    const sleepStart = addMinutes(baseSleepStart, shift);
    const sleepEnd = addMinutes(baseSleepEnd, shift);
    const wakeStart = sleepEnd;
    const wakeEnd = sleepStart;

    const [sleepStartStr, sleepEndStr] = formatLocalRange(
      sleepStart,
      sleepEnd
    );
    const [wakeStartStr, wakeEndStr] = formatLocalRange(wakeStart, wakeEnd);

    const [sleepStartBJ, sleepEndBJ] = formatBeijingRange(
      sleepStart,
      sleepEnd
    );
    const [wakeStartBJ, wakeEndBJ] = formatBeijingRange(wakeStart, wakeEnd);

    rows.push({
      day: dayNum,
      date: thisDate,
      sleepStart: sleepStartStr,
      sleepEnd: sleepEndStr,
      wakeStart: wakeStartStr,
      wakeEnd: wakeEndStr,
      sleepStartBJ,
      sleepEndBJ,
      wakeStartBJ,
      wakeEndBJ,
    });
  }

  return rows;
}

export function shiftNotesUp(notes: Record<string, string>): Record<string, string> {
  const newNotes: Record<string, string> = {};

  for (const key in notes) {
    const shiftedDate = addDays(parseISO(key), -1);
    const newKey = format(shiftedDate, "yyyy-MM-dd");
    newNotes[newKey] = notes[key];
  }

  return newNotes;
}

export function shiftNotesDown(notes: Record<string, string>): Record<string, string> {
  const newNotes: Record<string, string> = {};

  for (const key in notes) {
    const shiftedDate = addDays(parseISO(key), 1);
    const newKey = format(shiftedDate, "yyyy-MM-dd");
    newNotes[newKey] = notes[key];
  }

  return newNotes;
}

export function getStepValue(value: number): number {
  const str = value.toString();
  const decimal = str.split(".")[1];
  if (!decimal) return 1;
  return 1 / Math.pow(10, decimal.length);
}
