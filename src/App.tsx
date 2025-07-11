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
  createTheme,
} from "@mui/material";
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

const LOCAL_TZ = "America/Vancouver";
const BEIJING_TZ = "Asia/Shanghai";

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
});

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
  const [currentSleepStart, setCurrentSleepStart] = useState(() => localStorage.getItem("currentSleepStart") || "21:54");
  const [currentSleepEnd, setCurrentSleepEnd] = useState(() => localStorage.getItem("currentSleepEnd") || "06:22");
  const [currentDate, setCurrentDate] = useState(() => localStorage.getItem("currentDate") || "2025-07-07");
  const [startDate, setStartDate] = useState(() => localStorage.getItem("startDate") || "2025-10-20");
  const [endDate, setEndDate] = useState(() => localStorage.getItem("endDate") || "2025-11-14");
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [dailyShiftMinutes, setDailyShiftMinutes] = useState(() => {
    const stored = localStorage.getItem("dailyShiftMinutes");
    return stored ? parseFloat(stored) : 51.43;
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

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          fontFamily: "monospace",
          backgroundColor: 'background.paper',
          color: 'text.primary',
        }}
      >
              <Container maxWidth="lg" sx={{ mt: 4, flexShrink: 0 }}>
          <Typography variant="h5" gutterBottom>
            Sleep Cycle Schedule (Vancouver ➜ Beijing)
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            sx={{ mb: 3, "& > *": { minWidth: 160 } }}
          >
            <TextField
              label="Sleep Start"
              type="time"
              value={currentSleepStart}
              onChange={(e) => setCurrentSleepStart(e.target.value)}
            />
            <TextField
              label="Sleep End"
              type="time"
              value={currentSleepEnd}
              onChange={(e) => setCurrentSleepEnd(e.target.value)}
            />
            <TextField
              label="Current Date"
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
            />
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <TextField
              label="Daily Shift (min)"
              type="number"
              inputProps={{ step: 0.1, min: 0 }}
              value={dailyShiftMinutes}
              onChange={(e) => setDailyShiftMinutes(Number(e.target.value))}
            />
          </Stack>
        </Container>

        <Box
          component={Paper}
          sx={{
            flexGrow: 1,
            maxWidth: "100vw",
            overflow: "auto",
            px: 2,
            pb: 2,
            backgroundColor: 'background.paper',
          }}
        >
          <Table stickyHeader size="small" sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#232323' }}>Day</TableCell>
                <TableCell sx={{ backgroundColor: '#232323' }}>Date</TableCell>
                <TableCell sx={{ backgroundColor: '#232323' }}>Sleep</TableCell>
                <TableCell sx={{ backgroundColor: '#232323' }}>Wake</TableCell>
                <TableCell sx={{ backgroundColor: '#232323' }}>Sleep (Beijing)</TableCell>
                <TableCell sx={{ backgroundColor: '#232323' }}>Wake (Beijing)</TableCell>
                <TableCell sx={{ backgroundColor: '#232323' }}>Notes</TableCell>
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
                      sx={selectedRow === day ? { backgroundColor: 'rgba(25, 118, 210, 0.15)' } : { cursor: 'pointer' }}
                    >
                      <TableCell sx={{ backgroundColor: selectedRow === day ? 'rgba(25, 118, 210, 0.15)' : '#232323' }}>{day}</TableCell>
                      <TableCell sx={{ backgroundColor: selectedRow === day ? 'rgba(25, 118, 210, 0.15)' : '#232323' }}>{format(date, "yyyy-MM-dd")} ({format(date, "EEE")})</TableCell>
                      <TableCell sx={{ backgroundColor: selectedRow === day ? 'rgba(25, 118, 210, 0.15)' : '#232323' }}>{`${sleepStart} - ${sleepEnd}`}</TableCell>
                      <TableCell sx={{ backgroundColor: selectedRow === day ? 'rgba(25, 118, 210, 0.15)' : '#232323' }}>{`${wakeStart} - ${wakeEnd}`}</TableCell>
                      <TableCell sx={{ backgroundColor: selectedRow === day ? 'rgba(25, 118, 210, 0.15)' : '#232323' }}>{`${sleepStartBJ} - ${sleepEndBJ}`}</TableCell>
                      <TableCell sx={{ backgroundColor: selectedRow === day ? 'rgba(25, 118, 210, 0.15)' : '#232323' }}>{`${wakeStartBJ} - ${wakeEndBJ}`}</TableCell>
                      <TableCell sx={{ backgroundColor: selectedRow === day ? 'rgba(25, 118, 210, 0.15)' : '#232323' }}>
                        <TextField
                          size="small"
                          placeholder="Add note..."
                          value={note}
                          onChange={(e) => handleNoteChange(day, date, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ minWidth: 200 }}
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
