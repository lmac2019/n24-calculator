import { useRef, useState, useEffect } from "react";
import {
  Container,
  TextField,
  Typography,
  Stack,
  Box,
  ThemeProvider,
  Button,
  ButtonGroup,
  Dialog,
} from "@mui/material";
import {
  DEFAULT_SLEEP_START,
  DEFAULT_SLEEP_END,
  DEFAULT_CURRENT_DATE,
  DEFAULT_START_DATE,
  DEFAULT_END_DATE,
  DEFAULT_DAILY_SHIFT_MINUTES,
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
} from "./styles";
import { generateSchedule, getStepValue } from "./utils";
import ScheduleTable, { ScheduleTableRef } from "./components/ScheduleTable";
import { usePersistentState } from "./hooks/usePersistantState";
import CalendarView, { CalendarEvent } from "./components/CalendarView";
import { ScheduleRow } from "./utils/scheduleUtils";
import { timeStringToDate } from "./utils/timeUtils";
import { addHours } from "date-fns";

function scheduleToCalendarEvents(schedule: ScheduleRow[]): CalendarEvent[] {
  return schedule.map((row, idx) => {
    // Helper to parse time from formatted string (e.g., '10:00 PM', '6:00 AM (next day)')
    const getTime = (base: Date, timeStr: string) => {
      // Extract HH:mm and AM/PM if present
      const match = timeStr.match(/(\d{1,2}):(\d{2}) ?([AP]M)?/i);
      if (!match) return base;
      let [_, h, m, ampm] = match;
      let hour = Number(h);
      if (ampm) {
        if (ampm.toUpperCase() === "PM" && hour !== 12) hour += 12;
        if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
      }
      const date = new Date(base);
      date.setHours(hour, Number(m), 0, 0);
      // If '(next day)' in string, add 1 day
      if (/next day/i.test(timeStr)) {
        date.setDate(date.getDate() + 1);
      }
      return date;
    };
    return {
      Id: idx + 1,
      Subject: "Sleep",
      StartTime: getTime(row.date, row.sleepStart),
      EndTime: getTime(row.date, row.sleepEnd),
    };
  });
}

function scheduleToBeijingCalendarEvents(
  schedule: ScheduleRow[]
): CalendarEvent[] {
  return schedule.map((row, idx) => {
    // Helper to parse time from formatted string (e.g., '10:00 PM', '6:00 AM (next day)')
    const getTime = (base: Date, timeStr: string) => {
      const match = timeStr.match(/(\d{1,2}):(\d{2}) ?([AP]M)?/i);
      if (!match) return base;
      let [_, h, m, ampm] = match;
      let hour = Number(h);
      if (ampm) {
        if (ampm.toUpperCase() === "PM" && hour !== 12) hour += 12;
        if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
      }
      const date = new Date(base);
      date.setHours(hour, Number(m), 0, 0);
      if (/next day/i.test(timeStr)) {
        date.setDate(date.getDate() + 1);
      }
      return date;
    };
    return {
      Id: idx + 1,
      Subject: "Sleep",
      StartTime: getTime(row.date, row.sleepStartBJ),
      EndTime: getTime(row.date, row.sleepEndBJ),
    };
  });
}

export default function App() {
  const scheduleTableRef = useRef<ScheduleTableRef>(null);
  const [view, setView] = useState<"table" | "calendar">("table");
  const [calendarViewType, setCalendarViewType] = useState<
    "vancouver" | "beijing"
  >("vancouver");

  const handleShiftNotesUp = () => {
    scheduleTableRef.current?.shiftNotesUp();
  };

  const handleShiftNotesDown = () => {
    scheduleTableRef.current?.shiftNotesDown();
  };

  const [currentSleepStart, setCurrentSleepStart] = usePersistentState({
    key: "currentSleepStart",
    defaultValue: DEFAULT_SLEEP_START,
  });

  const [currentSleepEnd, setCurrentSleepEnd] = usePersistentState({
    key: "currentSleepEnd",
    defaultValue: DEFAULT_SLEEP_END,
  });

  const [currentDate, setCurrentDate] = usePersistentState({
    key: "currentDate",
    defaultValue: DEFAULT_CURRENT_DATE,
  });

  const [startDate, setStartDate] = usePersistentState({
    key: "startDate",
    defaultValue: DEFAULT_START_DATE,
  });

  const [endDate, setEndDate] = usePersistentState({
    key: "endDate",
    defaultValue: DEFAULT_END_DATE,
  });

  const [dailyShiftMinutes, setDailyShiftMinutes] = usePersistentState({
    key: "dailyShiftMinutes",
    defaultValue: DEFAULT_DAILY_SHIFT_MINUTES,
    parser: parseFloat,
    serializer: String,
  });

  const schedule = generateSchedule(
    currentSleepStart,
    currentSleepEnd,
    currentDate,
    startDate,
    endDate,
    dailyShiftMinutes
  );

  // Shared calendar events for both views
  const LOCAL_STORAGE_KEY = "calendarEventsShared";
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Load events from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved).map((ev: any) => ({
        ...ev,
        StartTime: new Date(ev.StartTime),
        EndTime: new Date(ev.EndTime),
      }));
      setCalendarEvents(parsed);
    } else {
      setCalendarEvents(scheduleToCalendarEvents(schedule));
    }
    // eslint-disable-next-line
  }, []);

  // When schedule changes, update calendarEvents if not user-edited
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) {
      setCalendarEvents(scheduleToCalendarEvents(schedule));
    }
    // eslint-disable-next-line
  }, [
    currentSleepStart,
    currentSleepEnd,
    currentDate,
    startDate,
    endDate,
    dailyShiftMinutes,
  ]);

  // Handler for calendar event changes
  const handleCalendarEventsChange = (events: CalendarEvent[]) => {
    let toStore;
    if (calendarViewType === "beijing") {
      // Convert from Beijing time back to Vancouver time before storing
      toStore = events.map((ev) => ({
        ...ev,
        StartTime: addHours(new Date(ev.StartTime), -15),
        EndTime: addHours(new Date(ev.EndTime), -15),
      }));
    } else {
      // Already in Vancouver time
      toStore = events.map((ev) => ({
        ...ev,
        StartTime: new Date(ev.StartTime),
        EndTime: new Date(ev.EndTime),
      }));
    }
    setCalendarEvents(toStore);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toStore));
  };

  // Calendar event conversion for view
  const getCalendarEventsForView = () => {
    // Always use the original stored times for conversion
    if (calendarViewType === "vancouver") {
      return calendarEvents.map((ev) => ({ ...ev }));
    } else {
      // For Beijing, convert from the original Vancouver time only
      return calendarEvents.map((ev) => {
        // If the event was already shifted, revert to the original Vancouver time
        // by subtracting the offset if needed (but since we always store Vancouver time, just add offset once)
        return {
          ...ev,
          StartTime: new Date(ev.StartTime.getTime() + 15 * 60 * 60 * 1000),
          EndTime: new Date(ev.EndTime.getTime() + 15 * 60 * 60 * 1000),
        };
      });
    }
  };

  const step = getStepValue(dailyShiftMinutes);

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
            flexWrap="wrap"
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
                value={dailyShiftMinutes}
                onChange={(e) => setDailyShiftMinutes(Number(e.target.value))}
                slotProps={{
                  input: {
                    inputProps: { step },
                  },
                }}
                sx={textFieldStyles}
              />
            </Box>
            <Box sx={buttonGroupContainerStyles}>
              <ButtonGroup
                variant="outlined"
                size="large"
                sx={buttonGroupStyles}
              >
                <Button onClick={handleShiftNotesUp} sx={buttonStyles}>
                  SHIFT NOTES ↑
                </Button>
                <Button onClick={handleShiftNotesDown} sx={buttonStyles}>
                  SHIFT NOTES ↓
                </Button>
              </ButtonGroup>
            </Box>
            <Stack direction="row" spacing={1} sx={{ ml: 2, flexWrap: "wrap" }}>
              <ButtonGroup variant="contained">
                <Button
                  color={view === "table" ? "primary" : "inherit"}
                  onClick={() => setView("table")}
                >
                  Table View
                </Button>
                <Button
                  color={view === "calendar" ? "primary" : "inherit"}
                  onClick={() => setView("calendar")}
                >
                  Calendar View
                </Button>
              </ButtonGroup>
              {view === "calendar" && (
                <ButtonGroup variant="outlined">
                  <Button
                    color={
                      calendarViewType === "vancouver" ? "primary" : "inherit"
                    }
                    onClick={() => setCalendarViewType("vancouver")}
                  >
                    Vancouver Calendar
                  </Button>
                  <Button
                    color={
                      calendarViewType === "beijing" ? "primary" : "inherit"
                    }
                    onClick={() => setCalendarViewType("beijing")}
                  >
                    Beijing Calendar
                  </Button>
                </ButtonGroup>
              )}
            </Stack>
          </Stack>
        </Container>
        {view === "table" ? (
          <ScheduleTable ref={scheduleTableRef} schedule={schedule} />
        ) : (
          <CalendarView
            events={getCalendarEventsForView()}
            onEventsChange={handleCalendarEventsChange}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}
