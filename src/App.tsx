import React, { useState } from "react";
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

const DAILY_SHIFT_MINUTES = 51.4;
const LOCAL_TZ = "America/Vancouver";
const BEIJING_TZ = "Asia/Shanghai";

function timeStringToDate(baseDate: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  return setMinutes(setHours(baseDate, h), m);
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

  const nextDay =
    formatTz(startInBJ, "yyyy-MM-dd", { timeZone: BEIJING_TZ }) !==
    formatTz(endInBJ, "yyyy-MM-dd", { timeZone: BEIJING_TZ });

  return [startStr, `${endStr}${nextDay ? " (next day)" : ""}`];
}

function formatLocalRange(start: Date, end: Date): [string, string] {
  const startStr = format(start, "h:mm a");
  const endStr = format(end, "h:mm a");
  const nextDay = format(start, "yyyy-MM-dd") !== format(end, "yyyy-MM-dd");
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
  const [currentSleepStart, setCurrentSleepStart] = useState("10:00");
  const [currentSleepEnd, setCurrentSleepEnd] = useState("18:00");
  const [currentDate, setCurrentDate] = useState("2025-07-09");
  const [startDate, setStartDate] = useState("2025-07-09");
  const [endDate, setEndDate] = useState("2025-08-05");

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
      const shift = (offsetDays + i) * DAILY_SHIFT_MINUTES;

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

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        fontFamily: "monospace",
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
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 60 }}
          />
          <TextField
            label="Sleep End"
            type="time"
            value={currentSleepEnd}
            onChange={(e) => setCurrentSleepEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 60 }}
          />
          <TextField
            label="Current Date"
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
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
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell>Day</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Sleep</TableCell>
              <TableCell>Wake</TableCell>
              <TableCell>Sleep (Beijing)</TableCell>
              <TableCell>Wake (Beijing)</TableCell>
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
              }) => (
                <TableRow key={day}>
                  <TableCell>{day}</TableCell>
                  <TableCell>{format(date, "yyyy-MM-dd")}</TableCell>
                  <TableCell>{`${sleepStart} - ${sleepEnd}`}</TableCell>
                  <TableCell>{`${wakeStart} - ${wakeEnd}`}</TableCell>
                  <TableCell>{`${sleepStartBJ} - ${sleepEndBJ}`}</TableCell>
                  <TableCell>{`${wakeStartBJ} - ${wakeEndBJ}`}</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
