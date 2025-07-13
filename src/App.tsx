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
import { format } from "date-fns";
import {
  generateSchedule,
  getNoteKey,
  shiftNotesUp,
  shiftNotesDown,
  type ScheduleRow
} from "./utils";

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

  const schedule = generateSchedule(
    currentSleepStart,
    currentSleepEnd,
    currentDate,
    startDate,
    endDate,
    dailyShiftMinutes
  );

  const handleNoteChange = (day: number, date: Date, value: string) => {
    const key = getNoteKey(day, date);
    setNotes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleShiftNotesUp = () => {
    setNotes(prev => shiftNotesUp(prev, schedule));
  };

  const handleShiftNotesDown = () => {
    setNotes(prev => shiftNotesDown(prev, schedule));
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
                <Button onClick={handleShiftNotesUp} sx={buttonStyles}>
                  SHIFT NOTES ↑
                </Button>
                <Button onClick={handleShiftNotesDown} sx={buttonStyles}>
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
