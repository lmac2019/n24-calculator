import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  TextField,
  Typography,
  Stack,
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
  buttonStyles
} from "./styles";
import {
  generateSchedule,
  getStepValue,
} from "./utils";
import ScheduleTable, { ScheduleTableRef } from "./components/ScheduleTable";

export default function App() {
  const scheduleTableRef = useRef<ScheduleTableRef>(null);
  const [currentSleepStart, setCurrentSleepStart] = useState(() => localStorage.getItem("currentSleepStart") || DEFAULT_SLEEP_START);
  const [currentSleepEnd, setCurrentSleepEnd] = useState(() => localStorage.getItem("currentSleepEnd") || DEFAULT_SLEEP_END);
  const [currentDate, setCurrentDate] = useState(() => localStorage.getItem("currentDate") || DEFAULT_CURRENT_DATE);
  const [startDate, setStartDate] = useState(() => localStorage.getItem("startDate") || DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState(() => localStorage.getItem("endDate") || DEFAULT_END_DATE);
  const [dailyShiftMinutes, setDailyShiftMinutes] = useState(() => {
    const stored = localStorage.getItem("dailyShiftMinutes");
    return stored ? parseFloat(stored) : DEFAULT_DAILY_SHIFT_MINUTES;
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

  const schedule = generateSchedule(
    currentSleepStart,
    currentSleepEnd,
    currentDate,
    startDate,
    endDate,
    dailyShiftMinutes
  );

  const handleShiftNotesUp = () => {
    scheduleTableRef.current?.shiftNotesUp();
  };

  const handleShiftNotesDown = () => {
    scheduleTableRef.current?.shiftNotesDown();
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

        <ScheduleTable 
          ref={scheduleTableRef}
          schedule={schedule} 
        />
      </Box>
    </ThemeProvider>
  );
}
