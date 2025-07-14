import {
  format,
  setHours,
  setMinutes,
} from "date-fns";
import {
  zonedTimeToUtc,
  utcToZonedTime,
  format as formatTz,
} from "date-fns-tz";
import { LOCAL_TZ, BEIJING_TZ } from "../constants";

/**
 * Converts a time string (HH:MM) to a Date object based on a base date
 * @param baseDate - The base date to use for the time conversion
 * @param timeStr - Time string in HH:MM format (e.g., "14:30")
 * @returns A Date object with the time set to the specified time string
 * @example
 * ```typescript
 * const date = new Date('2024-01-15');
 * const timeDate = timeStringToDate(date, "14:30");
 * // Returns: Date object for 2024-01-15 14:30:00
 * ```
 */
export function timeStringToDate(baseDate: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  return setMinutes(setHours(baseDate, h), m);
}

/**
 * Determines if the end time is on the next day compared to the start time
 * @param start - The start date/time
 * @param end - The end date/time
 * @param timeZone - Optional timezone to use for comparison (defaults to local timezone)
 * @returns True if the end time is on the next day, false otherwise
 * @example
 * ```typescript
 * const start = new Date('2024-01-15 22:00');
 * const end = new Date('2024-01-16 06:00');
 * const isNext = isNextDay(start, end); // Returns: true
 * ```
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
 * @param localStart - The start time in local timezone
 * @param localEnd - The end time in local timezone
 * @returns A tuple containing [startTime, endTime] formatted in Beijing timezone
 * @example
 * ```typescript
 * const start = new Date('2024-01-15 22:00');
 * const end = new Date('2024-01-16 06:00');
 * const [startBJ, endBJ] = formatBeijingRange(start, end);
 * // Returns: ["2:00 PM", "6:00 AM (next day)"]
 * ```
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
 * @param start - The start time
 * @param end - The end time
 * @returns A tuple containing [startTime, endTime] formatted in local timezone
 * @example
 * ```typescript
 * const start = new Date('2024-01-15 22:00');
 * const end = new Date('2024-01-16 06:00');
 * const [startLocal, endLocal] = formatLocalRange(start, end);
 * // Returns: ["10:00 PM", "6:00 AM (next day)"]
 * ```
 */
export function formatLocalRange(start: Date, end: Date): [string, string] {
  const startStr = format(start, "h:mm a");
  const endStr = format(end, "h:mm a");
  const nextDay = isNextDay(start, end);
  return [startStr, `${endStr}${nextDay ? " (next day)" : ""}`];
}

/**
 * Generates a note key for a given day and date
 * @param day - The day number (unused but kept for API consistency)
 * @param date - The date to generate a key for
 * @returns A string key in "yyyy-MM-dd" format
 * @example
 * ```typescript
 * const date = new Date('2024-01-15');
 * const key = getNoteKey(1, date); // Returns: "2024-01-15"
 * ```
 */
export function getNoteKey(day: number, date: Date): string {
  return format(date, "yyyy-MM-dd");
} 