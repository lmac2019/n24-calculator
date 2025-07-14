import { addDays, parseISO, format } from "date-fns";

/**
 * Shifts all notes up by one day (moves each note to the previous day)
 * 
 * This function is useful when you need to adjust all notes in a schedule
 * to account for a schedule shift. Each note's date key is moved back by one day.
 * 
 * @param notes - Object mapping date keys (YYYY-MM-DD) to note content
 * @returns New notes object with all dates shifted up by one day
 * 
 * @example
 * ```typescript
 * const notes = {
 *   "2024-01-20": "First day note",
 *   "2024-01-21": "Second day note",
 *   "2024-01-22": "Third day note"
 * };
 * const shiftedNotes = shiftNotesUp(notes);
 * // Returns: {
 * //   "2024-01-19": "First day note",
 * //   "2024-01-20": "Second day note", 
 * //   "2024-01-21": "Third day note"
 * // }
 * ```
 */
export function shiftNotesUp(notes: Record<string, string>): Record<string, string> {
  const newNotes: Record<string, string> = {};

  for (const key in notes) {
    const shiftedDate = addDays(parseISO(key), -1);
    const newKey = format(shiftedDate, "yyyy-MM-dd");
    newNotes[newKey] = notes[key];
  }

  return newNotes;
}

/**
 * Shifts all notes down by one day (moves each note to the next day)
 * 
 * This function is useful when you need to adjust all notes in a schedule
 * to account for a schedule shift. Each note's date key is moved forward by one day.
 * 
 * @param notes - Object mapping date keys (YYYY-MM-DD) to note content
 * @returns New notes object with all dates shifted down by one day
 * 
 * @example
 * ```typescript
 * const notes = {
 *   "2024-01-20": "First day note",
 *   "2024-01-21": "Second day note",
 *   "2024-01-22": "Third day note"
 * };
 * const shiftedNotes = shiftNotesDown(notes);
 * // Returns: {
 * //   "2024-01-21": "First day note",
 * //   "2024-01-22": "Second day note",
 * //   "2024-01-23": "Third day note"
 * // }
 * ```
 */
export function shiftNotesDown(notes: Record<string, string>): Record<string, string> {
  const newNotes: Record<string, string> = {};

  for (const key in notes) {
    const shiftedDate = addDays(parseISO(key), 1);
    const newKey = format(shiftedDate, "yyyy-MM-dd");
    newNotes[newKey] = notes[key];
  }

  return newNotes;
} 