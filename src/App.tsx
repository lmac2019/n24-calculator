import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Stack,
  Paper,
  Box,
  ThemeProvider,
  Button,
  ButtonGroup,
} from "@mui/material";
import { 
  LOCAL_TZ, 
  BEIJING_TZ, 
  DEFAULT_SLEEP_START,
  DEFAULT_SLEEP_END,
  DEFAULT_CURRENT_DATE,
  DEFAULT_START_DATE,
  DEFAULT_END_DATE,
  DEFAULT_DAILY_SHIFT_MINUTES
} from "./constants";
import {
  darkTheme,
  mainContainerStyles,
  headerContainerStyles,
  formControlsStackStyles,
  formInputsContainerStyles,
  textFieldStyles,
  buttonGroupContainerStyles,
  buttonGroupStyles,
  buttonStyles,
  tableContainerStyles,
  tableStyles,
  tableHeaderCellStyles,
  getTableRowStyles,
  getTableCellStyles,
  notesTextFieldStyles
} from "./styles";
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



function timeStringToDate(baseDate: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  return setMinutes(setHours(baseDate, h), m);
}

function isNextDay(start: Date, end: Date, timeZone?: string) {
  const getHour = (d: Date) => timeZone ? parseInt(formatTz(d, "H", { timeZone }), 10) : d.getHours();
  const getMinute = (d: Date) => timeZone ? parseInt(formatTz(d, "m", { timeZone }), 10) : d.getMinutes();
  const startHour = getHour(start);
  const startMinute = getMinute(start);
  const endHour = getHour(end);
  const endMinute = getMinute(end);
  return (endHour < startHour) || (endHour === startHour && endMinute <= startMinute);
}

function formatBeijingRange(
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

function formatLocalRange(start: Date, end: Date): [string, string] {
  const startStr = format(start, "h:mm a");
  const endStr = format(end, "h:mm a");
  const nextDay = isNextDay(start, end);
  return [startStr, `${endStr}${nextDay ? " (next day)" : ""}`];
}

type ScheduleRow = {
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

export default function App() {
  const [currentSleepStart, setCurrentSleepStart] = useState(() => localStorage.getItem("currentSleepStart") || DEFAULT_SLEEP_START);
  const [currentSleepEnd, setCurrentSleepEnd] = useState(() => localStorage.getItem("currentSleepEnd") || DEFAULT_SLEEP_END);
  const [currentDate, setCurrentDate] = useState(() => localStorage.getItem("currentDate") || DEFAULT_CURRENT_DATE);
  const [startDate, setStartDate] = useState(() => localStorage.getItem("startDate") || DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState(() => localStorage.getItem("endDate") || DEFAULT_END_DATE);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [dailyShiftMinutes, setDailyShiftMinutes] = useState(() => {
    const stored = localStorage.getItem("dailyShiftMinutes");
    return stored ? parseFloat(stored) : DEFAULT_DAILY_SHIFT_MINUTES;
  });
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const stored = localStorage.getItem("scheduleNotes");
    return stored ? JSON.parse(stored) : {};
  });

  // Save input values to localStorage when they change
  useEffect(() => {
    localStorage.setItem("currentSleepStart", currentSleepStart);
  }, [currentSleepStart]);
  useEffect(() => {
    localStorage.setItem("currentSleepEnd", currentSleepEnd);
  }, [currentSleepEnd]);
  useEffect(() => {
    localStorage.setItem("currentDate", currentDate);
  }, [currentDate]);
  useEffect(() => {
    localStorage.setItem("startDate", startDate);
  }, [startDate]);
  useEffect(() => {
    localStorage.setItem("endDate", endDate);
  }, [endDate]);
  useEffect(() => {
    localStorage.setItem("dailyShiftMinutes", String(dailyShiftMinutes));
  }, [dailyShiftMinutes]);
  useEffect(() => {
    localStorage.setItem("scheduleNotes", JSON.stringify(notes));
  }, [notes]);

  const generateSchedule = (): ScheduleRow[] => {
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
  };

  const schedule = generateSchedule();

  const getNoteKey = (day: number, date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  const handleNoteChange = (day: number, date: Date, value: string) => {
    const key = getNoteKey(day, date);
    setNotes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const shiftNotesUp = () => {
    setNotes(prev => {
      const newNotes: Record<string, string> = {};
      
      // Get all the dates from the schedule
      const scheduleDates = schedule.map(row => format(row.date, "yyyy-MM-dd"));
      
      // For each date in the schedule, move the note from the next day
      for (let i = 0; i < scheduleDates.length - 1; i++) {
        const currentDate = scheduleDates[i];
        const nextDate = scheduleDates[i + 1];
        
        if (prev[nextDate]) {
          newNotes[currentDate] = prev[nextDate];
        }
      }
      
      return newNotes;
    });
  };

  const shiftNotesDown = () => {
    setNotes(prev => {
      const newNotes: Record<string, string> = {};
      
      // Get all the dates from the schedule
      const scheduleDates = schedule.map(row => format(row.date, "yyyy-MM-dd"));
      
      // For each date in the schedule, move the note from the previous day
      for (let i = 1; i < scheduleDates.length; i++) {
        const currentDate = scheduleDates[i];
        const prevDate = scheduleDates[i - 1];
        
        if (prev[prevDate]) {
          newNotes[currentDate] = prev[prevDate];
        }
      }
      
      return newNotes;
    });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={mainContainerStyles}>
              <Container maxWidth="lg" sx={headerContainerStyles}>
          <Typography variant="h5" gutterBottom>
            Sleep Cycle Schedule (Vancouver ➜ Beijing)
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
            sx={formControlsStackStyles}
          >
            <Box sx={formInputsContainerStyles}>
              <TextField
                label="Sleep Start"
                type="time"
                value={currentSleepStart}
                onChange={(e) => setCurrentSleepStart(e.target.value)}
                sx={textFieldStyles}
              />
              <TextField
                label="Sleep End"
                type="time"
                value={currentSleepEnd}
                onChange={(e) => setCurrentSleepEnd(e.target.value)}
                sx={textFieldStyles}
              />
              <TextField
                label="Current Date"
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                sx={textFieldStyles}
              />
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                sx={textFieldStyles}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                sx={textFieldStyles}
              />
              <TextField
                label="Daily Shift (min)"
                type="number"
                inputProps={{ step: 0.1, min: 0 }}
                value={dailyShiftMinutes}
                onChange={(e) => setDailyShiftMinutes(Number(e.target.value))}
                sx={textFieldStyles}
              />
            </Box>
            <Box sx={buttonGroupContainerStyles}>
              <ButtonGroup variant="outlined" size="large" sx={buttonGroupStyles}>
                <Button onClick={shiftNotesUp} sx={buttonStyles}>
                  SHIFT NOTES ↑
                </Button>
                <Button onClick={shiftNotesDown} sx={buttonStyles}>
                  SHIFT NOTES ↓
                </Button>
              </ButtonGroup>
            </Box>
          </Stack>
        </Container>

        <Box component={Paper} sx={tableContainerStyles}>
          <Table stickyHeader size="small" sx={tableStyles}>
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeaderCellStyles}>Day</TableCell>
                <TableCell sx={tableHeaderCellStyles}>Date</TableCell>
                <TableCell sx={tableHeaderCellStyles}>Sleep</TableCell>
                <TableCell sx={tableHeaderCellStyles}>Wake</TableCell>
                <TableCell sx={tableHeaderCellStyles}>Sleep (Beijing)</TableCell>
                <TableCell sx={tableHeaderCellStyles}>Wake (Beijing)</TableCell>
                <TableCell sx={tableHeaderCellStyles}>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedule.map(
                ({
                  day,
                  date,
                  sleepStart,
                  sleepEnd,
                  wakeStart,
                  wakeEnd,
                  sleepStartBJ,
                  sleepEndBJ,
                  wakeStartBJ,
                  wakeEndBJ,
                }) => {
                  const noteKey = getNoteKey(day, date);
                  const note = notes[noteKey] || "";
                  
                  return (
                    <TableRow
                      key={day}
                      hover
                      selected={selectedRow === day}
                      onClick={() => setSelectedRow(selectedRow === day ? null : day)}
                      sx={getTableRowStyles(selectedRow, day)}
                    >
                      <TableCell sx={getTableCellStyles(selectedRow, day)}>{day}</TableCell>
                      <TableCell sx={getTableCellStyles(selectedRow, day)}>{format(date, "yyyy-MM-dd")} ({format(date, "EEE")})</TableCell>
                      <TableCell sx={getTableCellStyles(selectedRow, day)}>{`${sleepStart} - ${sleepEnd}`}</TableCell>
                      <TableCell sx={getTableCellStyles(selectedRow, day)}>{`${wakeStart} - ${wakeEnd}`}</TableCell>
                      <TableCell sx={getTableCellStyles(selectedRow, day)}>{`${sleepStartBJ} - ${sleepEndBJ}`}</TableCell>
                      <TableCell sx={getTableCellStyles(selectedRow, day)}>{`${wakeStartBJ} - ${wakeEndBJ}`}</TableCell>
                      <TableCell sx={getTableCellStyles(selectedRow, day)}>
                        <TextField
                          size="small"
                          placeholder="Add note..."
                          value={note}
                          onChange={(e) => handleNoteChange(day, date, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          sx={notesTextFieldStyles}
                        />
                      </TableCell>
                    </TableRow>
                  );
                }
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
