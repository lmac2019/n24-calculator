import {
  addDays,
  differenceInDays,
  parseISO,
  addMinutes,
} from "date-fns";
import { timeStringToDate, formatLocalRange, formatBeijingRange } from "./timeUtils";

/**
 * Represents a single row in the sleep schedule table
 */
export type ScheduleRow = {
  /** The day number in the schedule (1-based) */
  day: number;
  /** The date for this schedule entry */
  date: Date;
  /** Sleep start time in local timezone (formatted string) */
  sleepStart: string;
  /** Sleep end time in local timezone (formatted string) */
  sleepEnd: string;
  /** Wake start time in local timezone (formatted string) */
  wakeStart: string;
  /** Wake end time in local timezone (formatted string) */
  wakeEnd: string;
  /** Sleep start time in Beijing timezone (formatted string) */
  sleepStartBJ: string;
  /** Sleep end time in Beijing timezone (formatted string) */
  sleepEndBJ: string;
  /** Wake start time in Beijing timezone (formatted string) */
  wakeStartBJ: string;
  /** Wake end time in Beijing timezone (formatted string) */
  wakeEndBJ: string;
};

/**
 * Generates a complete sleep schedule based on input parameters
 * 
 * This function creates a schedule that gradually shifts sleep times by the specified
 * daily shift amount. Each day's sleep and wake times are calculated by applying
 * the cumulative shift to the base sleep times.
 * 
 * @param currentSleepStart - Current sleep start time in HH:MM format (e.g., "22:00")
 * @param currentSleepEnd - Current sleep end time in HH:MM format (e.g., "06:00")
 * @param currentDate - Current date in YYYY-MM-DD format (baseline for calculations)
 * @param startDate - Start date for the schedule in YYYY-MM-DD format
 * @param endDate - End date for the schedule in YYYY-MM-DD format
 * @param dailyShiftMinutes - Minutes to shift sleep time each day (can be negative)
 * @returns Array of ScheduleRow objects representing the complete schedule
 * 
 * @example
 * ```typescript
 * const schedule = generateSchedule(
 *   "22:00",           // Sleep at 10 PM
 *   "06:00",           // Wake at 6 AM
 *   "2024-01-15",      // Current date
 *   "2024-01-20",      // Start date
 *   "2024-01-25",      // End date
 *   30                  // Shift 30 minutes later each day
 * );
 * // Returns: Array of 6 ScheduleRow objects (Jan 20-25)
 * // Day 1: 22:00-06:00, Day 2: 22:30-06:30, etc.
 * ```
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